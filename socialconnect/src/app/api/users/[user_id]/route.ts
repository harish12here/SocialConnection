import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = await params
    const supabase = getServiceClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (error || !profile) {
      return errorResponse('User not found', 404)
    }

    return successResponse(profile)
  } catch (err: any) {
    return errorResponse('Failed to fetch profile', 500, err)
  }
}
