import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!actor_id(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return successResponse([])
    }

    return successResponse(notifications || [])
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch notifications', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await request.json().catch(() => ({}))
    const { id } = body

    let query = supabase.from('notifications').update({ is_read: true })

    if (id) {
      query = query.eq('id', id).eq('user_id', user.id)
    } else {
      query = query.eq('user_id', user.id)
    }

    const { error } = await query
    if (error) return errorResponse(error.message, 400)

    return successResponse({ message: 'Notifications marked as read' })
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update notifications', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { user_id, type, entity_id, content } = await request.json()

    // Don't notify self
    if (user_id === user.id) {
      return successResponse({ message: 'Self notification skipped' })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        actor_id: user.id,
        type,
        entity_id: entity_id || null,
        content
      })
      .select()
      .single()

    if (error) {
      return successResponse({ message: 'Notification skipped' })
    }

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create notification', 500)
  }
}
