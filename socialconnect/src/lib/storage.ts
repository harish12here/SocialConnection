import { apiClient } from './api-client'

export async function uploadFile(file: File, bucket: 'posts' | 'avatars'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)

  const res = await apiClient('/api/upload', {
    method: 'POST',
    body: formData,
    // Note: Do not set 'Content-Type' header when sending FormData,
    // the browser will automatically set it with the correct boundary
  })

  if (!res.success) {
    throw new Error(res.message || 'Upload failed')
  }

  return res.data.url
}
