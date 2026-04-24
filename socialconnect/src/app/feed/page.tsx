'use client'

import React, { useEffect, useState } from 'react'
import { Post } from '@/types'
import PostCard from '@/components/PostCard'
import { PlusCircleIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await apiClient('/api/feed')
        if (res.success) {
          setPosts(res.data.posts)
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError('Failed to load feed')
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [])

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2Icon className="animate-spin mb-4" size={32} />
        <p>Loading your feed...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-indigo-400 uppercase">
                  {user?.username?.[0] || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Welcome back</p>
              <h1 className="text-3xl font-bold text-white">
                {user ? `${user.first_name} ${user.last_name}` : 'SocialConnect User'}
              </h1>
            </div>
          </div>
          <Link href="/create" className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto">
            <PlusCircleIcon size={20} />
            <span>New Post</span>
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">Your Feed</p>
            <p className="text-slate-500">Stay updated with the latest from your network.</p>
          </div>
          <p className="text-sm text-slate-500">Responsive, polished, and easy to scan.</p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl mb-6">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <p className="text-slate-400 mb-4">No posts yet. Start following people to fill your feed.</p>
          <Link href="/discover" className="text-indigo-400 font-medium">Explore People</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

