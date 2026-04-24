import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const { user_id } = await params
    const supabase = getServiceClient()

    const { data: following, error } = await supabase
      .from('follows')
      .select(`
        following:profiles!following_id(*)
      `)
      .eq('follower_id', user_id)

    if (error) return handleSupabaseError(error)

    return successResponse(following.map(f => f.following))
  } catch (err: any) {
    return errorResponse('Failed to fetch following', 500, err)
  }
}
