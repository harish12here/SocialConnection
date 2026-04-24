import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await req.json()
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return errorResponse('Current password and new password are required', 400)
    }

    if (typeof new_password !== 'string' || new_password.length < 8) {
      return errorResponse('New password must be at least 8 characters', 400)
    }

    const supabase = getServiceClient()
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(user.id)

    if (userError || !authUser?.user?.email) {
      return errorResponse('Unable to verify account email', 500)
    }

    const email = authUser.user.email

    const { createClient } = await import('@supabase/supabase-js')
    const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const anonClient = createClient(anonUrl, anonKey)

    const { error: verifyError } = await anonClient.auth.signInWithPassword({
      email,
      password: current_password
    })

    if (verifyError) {
      return errorResponse('Current password is incorrect', 401, verifyError)
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: new_password
    })

    if (updateError) return handleSupabaseError(updateError)

    return successResponse(null, 'Password updated successfully')
  } catch (err: any) {
    return errorResponse('Failed to update password', 500, err)
  }
}
