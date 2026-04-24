import { NextResponse } from 'next/server'

export type ApiResponse<T = any> = {
  success: boolean
  status: number
  message: string
  data?: T
  error?: string
}

const statusMessages: Record<number, string> = {
  200: 'Success',
  201: 'Resource created successfully',
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Resource not found',
  409: 'Conflict',
  422: 'Validation error',
  500: 'Internal server error',
  503: 'Service unavailable',
}

/**
 * Standardized Success Response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    status,
    message: message || statusMessages[status] || 'Success',
    data,
  }

  return NextResponse.json(response, { status })
}

/**
 * Standardized Error Response
 */
export function errorResponse(
  message?: string,
  status: number = 500,
  error?: any
) {
  // Log error for server-side debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[API Error] ${status}:`, error || message)
  }

  const response: ApiResponse = {
    success: false,
    status,
    message: message || statusMessages[status] || 'Error occurred',
    error: error instanceof Error ? error.message : (typeof error === 'string' ? error : undefined),
  }

  return NextResponse.json(response, { status })
}

/**
 * Handle Supabase specific errors
 */
export function handleSupabaseError(error: any) {
  if (!error) return null

  // Supabase error codes mapping (example)
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#error-handling
  
  const code = error.code || error.status
  let status = 400
  let message = error.message

  if (code === 'PGRST116') { // Not found
    status = 404
    message = 'Resource not found'
  } else if (code === '23505') { // Unique violation
    status = 409
    message = 'Already exists'
  } else if (code === '42501') { // Permission denied
    status = 403
    message = 'Insufficient permissions'
  }

  return errorResponse(message, status, error)
}
