import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { createToken } from '@/lib/jwt'

export async function POST(req: Request) {
  try {
    const { email, username, password, first_name, last_name } = await req.json()

    // 1. Validation
    if (!email || !username || !password || !first_name || !last_name) {
      return errorResponse('All fields are required', 400)
    }

    if (username.length < 3 || username.length > 30) {
      return errorResponse('Username must be 3-30 chars', 400)
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return errorResponse('Username can only contain letters, numbers and underscores', 400)
    }

    const supabase = getServiceClient()

    // 2. Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return errorResponse('Username already taken', 409)
    }

    // 3. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, first_name, last_name }
    })

    if (authError) return handleSupabaseError(authError)

    const userId = authData.user.id

    // 4. Create Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        first_name,
        last_name,
        posts_count: 0,
        followers_count: 0,
        following_count: 0
      })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      return handleSupabaseError(profileError)
    }

    // 5. Create token
    const token = await createToken({ id: userId, email, username })

    // 6. Success
    const response = successResponse({
      user: { id: userId, email, username, first_name, last_name },
      token
    }, 'Account created successfully', 201)

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24
    })

    return response

  } catch (err: any) {
    return errorResponse('Internal server error during registration', 500, err)
  }
}
