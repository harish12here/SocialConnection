import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

/**
 * Send a message
 * POST /api/messages
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { receiver_id, content } = await req.json()

    if (!receiver_id || !content) {
      return errorResponse('Receiver and content are required', 400)
    }

    const supabase = getServiceClient()

    // 1. Check if sender is following receiver
    const { data: follow, error: followError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', receiver_id)
      .single()

    if (!follow) {
      return errorResponse('You can only message users you are following', 403)
    }

    // 2. Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        content
      })
      .select(`
        *,
        sender:profiles!sender_id(*),
        receiver:profiles!receiver_id(*)
      `)
      .single()

    if (messageError) return handleSupabaseError(messageError)

    return successResponse(message, 'Message sent', 201)
  } catch (err: any) {
    return errorResponse('Failed to send message', 500, err)
  }
}

/**
 * Get conversation list (latest message from each unique chat partner)
 * GET /api/messages
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const supabase = getServiceClient()

    // This is a bit complex for Supabase without RPC, but we can fetch recent messages
    // and filter unique partners in JS for simplicity in this MVP
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(*),
        receiver:profiles!receiver_id(*)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) return handleSupabaseError(error)

    // Group by conversation partner
    const conversationsMap = new Map()
    messages?.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner: msg.sender_id === user.id ? msg.receiver : msg.sender,
          lastMessage: msg
        })
      }
    })

    return successResponse(Array.from(conversationsMap.values()))
  } catch (err: any) {
    return errorResponse('Failed to fetch conversations', 500, err)
  }
}
