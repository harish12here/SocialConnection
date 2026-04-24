'use client'

import React, { useEffect, useState } from 'react'
import { Post } from '@/types'
import PostCard from '@/components/PostCard'
import { Loader2Icon, ArrowLeftIcon } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PostDetailPage() {
  const { post_id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiClient(`/api/posts/${post_id}`)
        if (res.success) {
          setPost(res.data)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (post_id) fetchPost()
  }, [post_id])

  const handleDelete = () => {
    router.push('/feed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="animate-spin text-indigo-500" size={32} />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-slate-400 text-lg mb-6">Post not found or has been deleted.</p>
        <Link href="/feed" className="text-indigo-400 hover:underline font-medium">← Back to Feed</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon size={18} />
          <span>Back</span>
        </button>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Post</h1>
      <PostCard post={post} onDelete={handleDelete} />
    </div>
  )
}
