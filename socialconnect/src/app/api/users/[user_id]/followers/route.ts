import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = await params
    const supabase = getServiceClient()

    const { data: followers, error } = await supabase
      .from('follows')
      .select(`
        follower:profiles!follower_id(*)
      `)
      .eq('following_id', user_id)

    if (error) return handleSupabaseError(error)

    return successResponse(followers.map(f => f.follower))
  } catch (err: any) {
    return errorResponse('Failed to fetch followers', 500, err)
  }
}
