import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

/**
 * Get all comments for a post
 * GET /api/posts/[post_id]/comments
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const { post_id } = await params
    const supabase = getServiceClient()

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('post_id', post_id)
      .order('created_at', { ascending: true })

    if (error) return handleSupabaseError(error)

    return successResponse(comments)
  } catch (err: any) {
    return errorResponse('Failed to fetch comments', 500, err)
  }
}

/**
 * Add a comment to a post
 * POST /api/posts/[post_id]/comments
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { post_id } = await params
    const { content } = await req.json()

    if (!content || content.length > 500) {
      return errorResponse('Comment must be 1-500 characters', 400)
    }

    const supabase = getServiceClient()

    // 1. Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        content,
        user_id: user.id,
        post_id: post_id
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single()

    if (commentError) return handleSupabaseError(commentError)

    // 2. Increment comment count on post
    const { data: post } = await supabase.from('posts').select('comment_count').eq('id', post_id).single()
    await supabase.from('posts').update({ comment_count: (post?.comment_count || 0) + 1 }).eq('id', post_id)

    return successResponse(comment, 'Comment added', 201)
  } catch (err: any) {
    return errorResponse('Failed to add comment', 500, err)
  }
}
