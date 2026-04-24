'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Post, Comment } from '@/types'
import { useAuth } from '@/context/AuthContext'
import {
  HeartIcon,
  MessageCircleIcon,
  Share2Icon,
  MoreHorizontalIcon,
  SendIcon,
  Loader2Icon,
  Trash2Icon,
  FlagIcon,
  LinkIcon,
  Edit2Icon,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

interface PostCardProps {
  post: Post
  onDelete?: (postId: string) => void
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth()

  // Like state
  const [liked, setLiked] = useState(post.liked_by_me || false)
  const [likesCount, setLikesCount] = useState(post.like_count)

  // Comments state
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count)

  // Options menu state
  const [showOptions, setShowOptions] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [updateLoading, setUpdateLoading] = useState(false)
  const optionsRef = useRef<HTMLDivElement>(null)

  const isOwnPost = user?.id === post.author_id

  // Close options menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowOptions(false)
      }
    }
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showOptions])

  // --- Like ---
  const handleLike = async () => {
    if (!user) return
    const previousLiked = liked
    const previousCount = likesCount
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    try {
      const res = await apiClient(`/api/posts/${post.id}/like`, {
        method: liked ? 'DELETE' : 'POST',
      })
      if (!res.success) throw new Error(res.message)
    } catch {
      setLiked(previousLiked)
      setLikesCount(previousCount)
    }
  }

  // --- Comments ---
  const fetchComments = async () => {
    setCommentsLoading(true)
    try {
      const res = await apiClient(`/api/posts/${post.id}/comments`)
      if (res.success) setComments(res.data)
    } catch (err) {
      console.error('Failed to load comments', err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments()
    }
    setShowComments(!showComments)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentText.trim() || commentSubmitting) return
    setCommentSubmitting(true)
    try {
      const res = await apiClient(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText.trim() }),
      })
      if (res.success) {
        setComments(prev => [...prev, res.data])
        setCommentCount(prev => prev + 1)
        setCommentText('')
      }
    } catch (err) {
      console.error('Failed to submit comment', err)
    } finally {
      setCommentSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    
    // Optimistic delete
    const previousComments = [...comments]
    setComments(prev => prev.filter(c => c.id !== commentId))
    setCommentCount(prev => Math.max(0, prev - 1))

    try {
      const res = await apiClient(`/api/posts/${post.id}/comments/${commentId}`, {
        method: 'DELETE'
      })
      if (!res.success) throw new Error(res.message)
    } catch (err) {
      // Rollback
      alert('Failed to delete comment')
      setComments(previousComments)
      setCommentCount(prev => prev + 1)
    }
  }

  // --- Share ---
  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Check this post on SocialConnect', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      }
    } catch {
      // user cancelled share
    }
  }

  // --- Delete ---
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    setDeleting(true)
    try {
      const res = await apiClient(`/api/posts/${post.id}`, { method: 'DELETE' })
      if (res.success) {
        onDelete?.(post.id)
      } else {
        alert(res.message || 'Failed to delete post')
      }
    } catch {
      alert('An error occurred while deleting')
    } finally {
      setDeleting(false)
      setShowOptions(false)
    }
  }

  // --- Update ---
  const handleUpdate = async () => {
    if (!editedContent.trim() || updateLoading) return
    setUpdateLoading(true)
    try {
      const res = await apiClient(`/api/posts/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editedContent.trim() })
      })
      if (res.success) {
        post.content = editedContent.trim() // Update local ref
        setIsEditing(false)
      } else {
        alert(res.message || 'Failed to update post')
      }
    } catch {
      alert('An error occurred while updating')
    } finally {
      setUpdateLoading(false)
    }
  }

  // --- Report ---
  const handleReport = () => {
    setShowOptions(false)
    alert('Post reported. Our team will review it shortly.')
  }

  // --- Copy Link ---
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/posts/${post.id}`
    await navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
    setShowOptions(false)
  }

  return (
    <article className="glass-card mb-6 overflow-hidden animate-slide-up border border-slate-800/50 shadow-xl shadow-black/10">
      {/* Header */}
      <div className="p-4 flex items-center justify-between gap-4">
        <Link href={`/profile/${post.author_id}`} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 overflow-hidden flex items-center justify-center">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt={post.author.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-400 font-bold uppercase">{post.author?.username?.[0]}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white leading-tight group-hover:text-indigo-400 transition-colors">
              {post.author?.first_name} {post.author?.last_name}
            </h3>
            <p className="text-xs text-slate-500">@{post.author?.username}</p>
          </div>
        </Link>

        {/* Three-dot options menu */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
            aria-label="Post options"
          >
            <MoreHorizontalIcon size={20} />
          </button>

          {showOptions && (
            <div className="absolute right-0 top-10 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <LinkIcon size={16} />
                <span>Copy link</span>
              </button>

              {isOwnPost ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowOptions(false)
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-t border-slate-700/50"
                  >
                    <Edit2Icon size={16} />
                    <span>Edit post</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-700/50"
                  >
                    {deleting ? (
                      <Loader2Icon size={16} className="animate-spin" />
                    ) : (
                      <Trash2Icon size={16} />
                    )}
                    <span>{deleting ? 'Deleting...' : 'Delete post'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleReport}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-700/50"
                >
                  <FlagIcon size={16} />
                  <span>Report post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none resize-none"
              rows={4}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(post.content)
                }}
                className="px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateLoading || !editedContent.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {updateLoading ? <Loader2Icon size={14} className="animate-spin" /> : null}
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        )}
      </div>

      {/* Media */}
      {post.image_url && (
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900">
            <img src={post.image_url} alt="Post content" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="p-4 flex flex-col gap-3 border-t border-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all ${
              liked ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-rose-500'
            }`}
          >
            <HeartIcon size={22} fill={liked ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button
            onClick={toggleComments}
            className={`flex items-center gap-2 transition-all ${
              showComments ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'
            }`}
          >
            <MessageCircleIcon size={22} />
            <span className="text-sm font-medium">{commentCount}</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-all ml-auto self-start sm:self-auto"
          aria-label="Share post"
        >
          <Share2Icon size={22} />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-slate-800/50 bg-slate-900/30">
          {/* Comment Input */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 p-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-indigo-400 font-bold uppercase">
                  {user.username?.[0]}
                </span>
              </div>
              <div className="flex-1 flex items-center bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 px-4 py-2.5 outline-none"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentSubmitting}
                  className="px-3 py-2.5 text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition-colors"
                >
                  {commentSubmitting ? (
                    <Loader2Icon size={18} className="animate-spin" />
                  ) : (
                    <SendIcon size={18} />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="px-4 pb-4 space-y-3 max-h-80 overflow-y-auto">
            {commentsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2Icon className="animate-spin text-indigo-500" size={24} />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <Link href={`/profile/${comment.user_id}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0 hover:border-indigo-500 transition-colors">
                      {comment.user?.avatar_url ? (
                        <img
                          src={comment.user.avatar_url}
                          alt={comment.user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 font-bold uppercase">
                          {comment.user?.username?.[0]}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 bg-slate-800/50 rounded-xl px-3 py-2.5 relative group">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <Link
                        href={`/profile/${comment.user_id}`}
                        className="text-xs font-semibold text-white hover:text-indigo-400 transition-colors"
                      >
                        {comment.user?.first_name} {comment.user?.last_name}
                      </Link>
                      <span className="text-xs text-slate-600">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 pr-6">{comment.content}</p>
                    
                    {user?.id === comment.user_id && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1"
                        aria-label="Delete comment"
                      >
                        <Trash2Icon size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  )
}
