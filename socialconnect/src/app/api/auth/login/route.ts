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
        .maybeSingle()
      
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

    if (authError || !data?.user) {
      return errorResponse('Invalid email/username or password', 401, authError)
    }

    const userId = data.user.id

    // 3. Get full profile and update last login
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    
    // Update last login timestamp asynchronously
    supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', userId).then()

    // 4. Create JWT token
    const token = await createToken({ 
      id: userId, 
      email: data.user.email, 
      username: profile?.username || identifier 
    })

    const userPayload = profile || { 
      id: userId, 
      email: data.user.email, 
      username: identifier,
      first_name: '',
      last_name: ''
    }

    const response = successResponse({
      user: userPayload,
      token
    }, 'Login successful')

    // 5. Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (err: any) {
    console.error('Login error:', err)
    return errorResponse('Login failed', 500, err)
  }
}
