import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

export async function GET(req: Request) {
  try {
    const user = await getAuthUser()
    const supabase = getServiceClient()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (user) {
      // Get IDs of followed users
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
      
      const followedIds = follows?.map(f => f.following_id) || []
      
      // Include own posts in the feed too
      const feedIds = [...followedIds, user.id]

      if (feedIds.length > 0) {
        query = query.in('author_id', feedIds)
      }
    }

    const { data: posts, error, count } = await query.range(from, to)

    if (error) return handleSupabaseError(error)

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        total: count
      }
    })
  } catch (err: any) {
    return errorResponse('Failed to fetch feed', 500, err)
  }
}
