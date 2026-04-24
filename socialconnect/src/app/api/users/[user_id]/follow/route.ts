import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

/**
 * Follow a user
 * POST /api/users/[user_id]/follow
 */
export async function POST(
  req: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { user_id: targetId } = await params
    if (user.id === targetId) return errorResponse('You cannot follow yourself', 400)

    const supabase = getServiceClient()

    // 1. Create follow (using upsert to avoid unique constraint errors if something got out of sync)
    const { error: followError } = await supabase
      .from('follows')
      .upsert({
        follower_id: user.id,
        following_id: targetId
      }, { onConflict: 'follower_id,following_id' })

    if (followError) return handleSupabaseError(followError)

    // 2. Update counts using RPC or manual increment (simplified for now)
    // We fetch current counts first to be sure
    const { data: targetProfile } = await supabase.from('profiles').select('followers_count').eq('id', targetId).single()
    const { data: selfProfile } = await supabase.from('profiles').select('following_count').eq('id', user.id).single()

    await Promise.all([
      supabase.from('profiles').update({ followers_count: (targetProfile?.followers_count || 0) + 1 }).eq('id', targetId),
      supabase.from('profiles').update({ following_count: (selfProfile?.following_count || 0) + 1 }).eq('id', user.id)
    ])

    return successResponse({ following: true }, 'Followed user')
  } catch (err: any) {
    return errorResponse('Failed to follow user', 500, err)
  }
}

/**
 * Unfollow a user
 * DELETE /api/users/[user_id]/follow
 */
export async function DELETE(
  req: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { user_id: targetId } = await params
    const supabase = getServiceClient()

    // 1. Delete follow
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetId)

    if (deleteError) return handleSupabaseError(deleteError)

    // 2. Update counts
    // Decrement follower count on target
    const { data: targetProfile } = await supabase.from('profiles').select('followers_count').eq('id', targetId).single()
    await supabase.from('profiles').update({ followers_count: Math.max(0, (targetProfile?.followers_count || 1) - 1) }).eq('id', targetId)
    
    // Decrement following count on self
    const { data: selfProfile } = await supabase.from('profiles').select('following_count').eq('id', user.id).single()
    await supabase.from('profiles').update({ following_count: Math.max(0, (selfProfile?.following_count || 1) - 1) }).eq('id', user.id)

    return successResponse({ following: false }, 'Unfollowed user')
  } catch (err: any) {
    return errorResponse('Failed to unfollow user', 500, err)
  }
}
