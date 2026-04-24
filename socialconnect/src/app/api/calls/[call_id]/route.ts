import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

/**
 * Update call status or signal data
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { call_id } = await params
    const { status, signal_data } = await req.json()

    const supabase = getServiceClient()

    const { data: call, error } = await supabase
      .from('calls')
      .update({
        status,
        signal_data,
        updated_at: new Date().toISOString()
      })
      .eq('id', call_id)
      .select()
      .single()

    if (error) return handleSupabaseError(error)

    return successResponse(call, 'Call updated')
  } catch (err: any) {
    return errorResponse('Failed to update call', 500, err)
  }
}

/**
 * Get specific call data
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { call_id } = await params
    const supabase = getServiceClient()

    const { data: call, error } = await supabase
      .from('calls')
      .select(`
        *,
        caller:profiles!caller_id(*),
        receiver:profiles!receiver_id(*)
      `)
      .eq('id', call_id)
      .single()

    if (error) return handleSupabaseError(error)

    return successResponse(call)
  } catch (err: any) {
    return errorResponse('Failed to fetch call', 500, err)
  }
}
