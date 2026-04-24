import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { createToken } from '@/lib/jwt'

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json()

    // The frontend might send the identifier in the 'email' field
    const identifier = (email || username || '').trim()
    if (!identifier || !password) {
      return errorResponse('Email/Username and password are required', 400)
    }

    const supabase = getServiceClient()
    let loginEmail = ''

    // 1. Resolve Email
    if (identifier.includes('@')) {
      loginEmail = identifier
    } else {
      // It's a username, lookup profile to get user ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', identifier)
        .single()
      
      if (profileError || !profile) {
        return errorResponse('Invalid username or password', 401)
      }

      // Get user email from auth admin
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id)
      if (userError || !userData?.user?.email) {
        return errorResponse('User account not found', 401)
      }
      loginEmail = userData.user.email
    }

    // 2. Authenticate with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    })

    if (authError) {
      return errorResponse(authError.message, 401, authError)
    }

    const userId = data.user.id

    // 3. Get full profile and update last login
    const [{ data: profile, error: profileFetchError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', userId)
    ])

    if (profileFetchError || !profile) {
      // If user exists in auth but no profile, we should still allow login but return minimal data
      console.warn(`Profile not found for user ${userId}`)
    }

    // 4. Create JWT token
    const token = await createToken({ 
      id: userId, 
      email: data.user.email, 
      username: profile?.username || identifier 
    })

    const response = successResponse({
      user: profile || { id: userId, email: data.user.email, username: identifier },
      token
    }, 'Login successful')

    // 5. Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (err: any) {
    console.error('Login error:', err)
    return errorResponse('Login failed', 500, err)
  }
}
