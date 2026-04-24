'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile } from '@/lib/storage'
import { ImageIcon, XIcon, SendIcon, Loader2Icon } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export default function CreatePostPage() {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB')
        return
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only JPEG and PNG are supported')
        return
      }
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content && !image) return
    
    setLoading(true)
    setError('')

    try {
      let image_url = null
      if (image) {
        image_url = await uploadFile(image, 'posts')
      }

      const res = await apiClient('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content, image_url })
      })

      if (res.success) {
        router.push('/feed')
      } else {
        setError(res.message)
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Create New Post</h1>

      <div className="glass-card p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            required
            maxLength={280}
            className="w-full h-40 bg-transparent border-none outline-none text-xl text-white placeholder:text-slate-600 resize-none"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <div className="relative">
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
              >
                <ImageIcon size={24} />
                <span className="font-medium text-sm">Add Media</span>
              </label>
            </div>

            <div className="text-slate-500 text-sm font-medium">
              {content.length}/280
            </div>
          </div>

          {preview && (
            <div className="relative mt-4 rounded-xl overflow-hidden group">
              <img src={preview} alt="Preview" className="w-full h-auto" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!content && !image)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2Icon className="animate-spin" size={20} />
            ) : (
              <>
                <SendIcon size={20} />
                <span>Post Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
