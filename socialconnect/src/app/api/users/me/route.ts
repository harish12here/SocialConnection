import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const supabase = getServiceClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return handleSupabaseError(error)

    return successResponse(profile)
  } catch (err: any) {
    return errorResponse('Failed to fetch profile', 500, err)
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await req.json()
    const { bio, avatar_url, website, location, first_name, last_name } = body

    // basic validation
    if (bio && bio.length > 160) {
      return errorResponse('Bio too long', 400)
    }

    const supabase = getServiceClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        bio,
        avatar_url,
        website,
        location,
        first_name,
        last_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) return handleSupabaseError(error)

    return successResponse(profile, 'Profile updated successfully')
  } catch (err: any) {
    return errorResponse('Update failed', 500, err)
  }
}

// Support PUT as well
export async function PUT(req: Request) {
  return PATCH(req)
}
