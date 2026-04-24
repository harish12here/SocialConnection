import { successResponse, errorResponse, handleSupabaseError } from '@/lib/api-response'
import { getServiceClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/jwt'

export async function POST(req: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string

    if (!file || !bucket) {
      return errorResponse('File and bucket are required', 400)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    
    // Convert File to ArrayBuffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const supabase = getServiceClient()

    // 1. Upload file using service role (bypasses RLS)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
      })

    if (error) {
      console.error('Storage Upload Error:', error)
      return handleSupabaseError(error)
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return successResponse({ url: publicUrl }, 'File uploaded successfully')
  } catch (err: any) {
    console.error('Upload API Error:', err)
    return errorResponse('Failed to upload file', 500, err)
  }
}
