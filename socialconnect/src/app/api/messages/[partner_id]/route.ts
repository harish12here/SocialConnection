import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

/**
 * Get messages history with a specific user
 * GET /api/messages/[partner_id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { partner_id } = await params
    const supabase = getServiceClient()

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(*),
        receiver:profiles!receiver_id(*)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partner_id}),and(sender_id.eq.${partner_id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) return handleSupabaseError(error)

    // Mark received messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', partner_id)
      .eq('is_read', false)

    return successResponse(messages)
  } catch (err: any) {
    return errorResponse('Failed to fetch chat history', 500, err)
  }
}
