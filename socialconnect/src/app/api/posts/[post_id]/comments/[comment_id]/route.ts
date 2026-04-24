import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

export async function DELETE(
  req: Request,
  { params }: { params: { post_id: string, comment_id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { post_id, comment_id } = await params
    const supabase = getServiceClient()

    // 1. Check ownership
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', comment_id)
      .single()

    if (!existingComment) return errorResponse('Comment not found', 404)
    if (existingComment.user_id !== user.id) return errorResponse('Forbidden', 403)

    // 2. Delete the comment
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id)

    if (deleteError) return handleSupabaseError(deleteError)

    // 3. Decrement comment count on post
    const { data: post } = await supabase.from('posts').select('comment_count').eq('id', post_id).single()
    if (post) {
      await supabase.from('posts').update({ comment_count: Math.max(0, post.comment_count - 1) }).eq('id', post_id)
    }

    return successResponse(null, 'Comment deleted successfully')
  } catch (err: any) {
    return errorResponse('Failed to delete comment', 500, err)
  }
}
