'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { uploadFile } from '@/lib/storage'
import { apiClient } from '@/lib/api-client'
import { Post } from '@/types'
import { ImageIcon, XIcon, SendIcon, Loader2Icon } from 'lucide-react'

interface CreatePostComposerProps {
  onPostCreated?: (newPost: Post) => void
}

export default function CreatePostComposer({ onPostCreated }: CreatePostComposerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    setError('')

    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'posts')
      }

      const res = await apiClient('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          image_url: imageUrl
        })
      })

      if (res.success) {
        setContent('')
        handleRemoveImage()
        onPostCreated?.(res.data)
      } else {
        setError(res.message || 'Failed to publish post')
      }
    } catch {
      setError('An error occurred while publishing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-card p-5 mb-8 border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/20 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Top Header Row */}
        <div className="flex space-x-3">
          <div className="w-11 h-11 rounded-full bg-indigo-500/20 border border-indigo-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-400 font-bold uppercase">{user.username?.[0]}</span>
            )}
          </div>

          <div className="flex-1">
            <textarea
              placeholder="What's on your mind? Share an update, idea, or media..."
              className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm md:text-base outline-none resize-none min-h-[80px]"
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={280}
            />
          </div>
        </div>

        {/* Image Preview Box */}
        {imagePreview && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-72 bg-slate-950">
            <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-500 transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Bottom Toolbar & Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors text-xs font-semibold">
              <ImageIcon size={18} className="text-indigo-400" />
              <span>Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            <span className="text-xs text-slate-500 font-mono">
              {content.length}/280
            </span>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 text-xs px-5 py-2"
          >
            {submitting ? (
              <Loader2Icon size={16} className="animate-spin" />
            ) : (
              <SendIcon size={16} />
            )}
            <span>{submitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>

      </form>
    </div>
  )
}
