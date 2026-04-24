import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

/**
 * Initiate a call
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { receiver_id, type, signal_data } = await req.json()

    const supabase = getServiceClient()

    const { data: call, error } = await supabase
      .from('calls')
      .insert({
        caller_id: user.id,
        receiver_id,
        type,
        signal_data,
        status: 'ringing'
      })
      .select(`
        *,
        caller:profiles!caller_id(*),
        receiver:profiles!receiver_id(*)
      `)
      .single()

    if (error) return handleSupabaseError(error)

    return successResponse(call, 'Call initiated', 201)
  } catch (err: any) {
    return errorResponse('Failed to initiate call', 500, err)
  }
}

/**
 * Get active calls (ringing) for the user
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const supabase = getServiceClient()

    const { data: calls, error } = await supabase
      .from('calls')
      .select(`
        *,
        caller:profiles!caller_id(*),
        receiver:profiles!receiver_id(*)
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'ringing')
      .order('created_at', { ascending: false })

    if (error) return handleSupabaseError(error)

    return successResponse(calls)
  } catch (err: any) {
    return errorResponse('Failed to fetch calls', 500, err)
  }
}
