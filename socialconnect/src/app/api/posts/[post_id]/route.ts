import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

export async function GET(
  req: Request,
  { params }: { params: { post_id: string } }
) {
  try {
    const { post_id } = await params
    const supabase = getServiceClient()

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('id', post_id)
      .single()

    if (error || !post) {
      return errorResponse('Post not found', 404)
    }

    return successResponse(post)
  } catch (err: any) {
    return errorResponse('Failed to fetch post', 500, err)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { post_id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { post_id } = await params
    const { content, image_url, is_active } = await req.json()

    const supabase = getServiceClient()

    // check ownership
    const { data: existing } = await supabase.from('posts').select('author_id').eq('id', post_id).single()
    if (!existing) return errorResponse('Post not found', 404)
    if (existing.author_id !== user.id) return errorResponse('Forbidden', 403)

    const { data: post, error } = await supabase
      .from('posts')
      .update({
        content,
        image_url,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', post_id)
      .select()
      .single()

    if (error) return handleSupabaseError(error)

    return successResponse(post, 'Post updated successfully')
  } catch (err: any) {
    return errorResponse('Update failed', 500, err)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { post_id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { post_id } = await params
    const supabase = getServiceClient()

    // check ownership
    const { data: existing } = await supabase.from('posts').select('author_id').eq('id', post_id).single()
    if (!existing) return errorResponse('Post not found', 404)
    if (existing.author_id !== user.id) return errorResponse('Forbidden', 403)

    const { error } = await supabase.from('posts').delete().eq('id', post_id)
    if (error) return handleSupabaseError(error)

    // Decrement post count
    const { data: profile } = await supabase.from('profiles').select('posts_count').eq('id', user.id).single()
    await supabase.from('profiles').update({ posts_count: Math.max(0, (profile?.posts_count || 1) - 1) }).eq('id', user.id)

    return successResponse(null, 'Post deleted successfully')
  } catch (err: any) {
    return errorResponse('Delete failed', 500, err)
  }
}
