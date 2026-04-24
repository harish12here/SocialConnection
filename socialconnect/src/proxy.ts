import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Define public routes
  const isPublicRoute = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname.startsWith('/api/auth')

  // API routes that need protection
  const isProtectedApi = 
    pathname.startsWith('/api/posts') || 
    pathname.startsWith('/api/users/me') ||
    pathname.startsWith('/api/feed')

  if (!token) {
    // If no token and trying to access protected UI route
    if (!isPublicRoute && !pathname.startsWith('/api') && pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // If no token and trying to access protected API
    if (isProtectedApi && request.method !== 'GET') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else {
    // Verify token
    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }

    // If logged in and trying to access login/register
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/feed', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
