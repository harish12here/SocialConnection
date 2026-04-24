import { ApiResponse } from './api-response'

/**
 * Enhanced fetch wrapper for the frontend
 */
export async function apiClient<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const isFormData = options.body instanceof FormData
    
    const headers = new Headers(options.headers || {})
    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || 'An error occurred',
        error: data.error,
      }
    }

    return data
  } catch (error: any) {
    // Handle network or parsing errors
    return {
      success: false,
      status: 0,
      message: 'Network error or server unreachable',
      error: error.message,
    }
  }
}

/**
 * Helper to display errors (example using alert, 
 * but should be replaced with toast like sonner)
 */
export function handleApiError(response: ApiResponse) {
  if (!response.success) {
    console.error(`[API Error] ${response.status}:`, response.error || response.message)
    // You can integrate a toast library here
    // toast.error(response.message)
    return response.message
  }
  return null
}
