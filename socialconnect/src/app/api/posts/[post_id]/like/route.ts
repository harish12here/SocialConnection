import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

/**
 * Toggle Like on a post
 * POST /api/posts/[post_id]/like
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { post_id } = await params
    const supabase = getServiceClient()

    // 1. Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', post_id)
      .single()

    if (existingLike) {
      return errorResponse('Already liked', 400)
    }

    // 2. Create like
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: post_id
      })

    if (likeError) return handleSupabaseError(likeError)

    // 3. Increment like count on post
    const { data: post } = await supabase.from('posts').select('like_count').eq('id', post_id).single()
    await supabase.from('posts').update({ like_count: (post?.like_count || 0) + 1 }).eq('id', post_id)

    return successResponse({ liked: true }, 'Post liked')
  } catch (err: any) {
    return errorResponse('Failed to like post', 500, err)
  }
}

/**
 * Remove Like from a post
 * DELETE /api/posts/[post_id]/like
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { post_id } = await params
    const supabase = getServiceClient()

    // 1. Delete like
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', post_id)

    if (deleteError) return handleSupabaseError(deleteError)

    // 2. Decrement like count on post
    const { data: post } = await supabase.from('posts').select('like_count').eq('id', post_id).single()
    await supabase.from('posts').update({ like_count: Math.max(0, (post?.like_count || 1) - 1) }).eq('id', post_id)

    return successResponse({ liked: false }, 'Post unliked')
  } catch (err: any) {
    return errorResponse('Failed to unlike post', 500, err)
  }
}
