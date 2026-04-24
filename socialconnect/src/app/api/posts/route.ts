import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = getServiceClient()

    const { data: posts, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to)

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
    return errorResponse('Failed to fetch posts', 500, err)
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { content, image_url } = await req.json()

    if (!content || content.length > 280) {
      return errorResponse('Content must be 1-280 chars', 400)
    }

    const supabase = getServiceClient()

    // 1. Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content,
        image_url,
        author_id: user.id
      })
      .select(`
        *,
        author:profiles(*)
      `)
      .single()

    if (error) {
      console.error('Supabase Insert Error:', error)
      return handleSupabaseError(error)
    }

    return successResponse(post, 'Post created successfully', 201)
  } catch (err: any) {
    console.error('Post Creation Error:', err)
    return errorResponse('Post creation failed', 500, err)
  }
}
