import { successResponse, errorResponse } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    
    const supabase = getServiceClient()
    
    let dbQuery = supabase
      .from('profiles')
      .select('id, username, first_name, last_name, avatar_url, bio')

    if (query) {
      dbQuery = dbQuery.or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    }

    const { data: users, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return successResponse(users)
  } catch (err: any) {
    return errorResponse('Failed to fetch users', 500, err)
  }
}
