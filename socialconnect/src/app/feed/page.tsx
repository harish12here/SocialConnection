'use client'

import React, { useEffect, useState } from 'react'
import { Post } from '@/types'
import PostCard from '@/components/PostCard'
import CreatePostComposer from '@/components/CreatePostComposer'
import { PostCardSkeleton } from '@/components/SkeletonLoader'
import { SparklesIcon, CompassIcon, UsersIcon, FlameIcon, RefreshCwIcon } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'

type FeedFilter = 'all' | 'following' | 'popular'

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all')

  const fetchFeed = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient('/api/feed')
      if (res.success) {
        setPosts(res.data.posts || [])
      } else {
        setError(res.message)
      }
    } catch {
      setError('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [])

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
  }

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'popular') {
      return post.like_count > 0 || post.comment_count > 0
    }
    return true
  }).sort((a, b) => {
    if (activeFilter === 'popular') {
      return (b.like_count + b.comment_count) - (a.like_count + a.comment_count)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="max-w-3xl mx-auto pb-20">
      
      {/* Header Banner */}
      <header className="mb-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Home Feed</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.first_name || 'Creator'} 👋
            </h1>
          </div>
          <button
            onClick={fetchFeed}
            className="btn-secondary text-xs flex items-center space-x-2 self-start sm:self-auto py-2 px-3"
            title="Refresh Feed"
          >
            <RefreshCwIcon size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Feed Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeFilter === 'all'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <SparklesIcon size={14} />
            <span>All Posts</span>
          </button>

          <button
            onClick={() => setActiveFilter('popular')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeFilter === 'popular'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <FlameIcon size={14} />
            <span>Trending</span>
          </button>
        </div>
      </header>

      {/* Embedded Composer */}
      <CreatePostComposer onPostCreated={handlePostCreated} />

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Feed Stream */}
      {loading ? (
        <div className="space-y-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 glass-card p-8 space-y-4">
          <CompassIcon size={48} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-xl font-bold text-white">No posts in your feed yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Be the first to share an update using the composer above, or discover new creators to follow.
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <Link href="/discover" className="btn-primary text-xs flex items-center space-x-2">
              <CompassIcon size={16} />
              <span>Discover People</span>
            </Link>
            <Link href="/connections" className="btn-secondary text-xs flex items-center space-x-2">
              <UsersIcon size={16} />
              <span>My Connections</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
