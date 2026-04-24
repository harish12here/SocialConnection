'use client'

import React, { useEffect, useState } from 'react'
import { User, Post } from '@/types'
import { useAuth } from '@/context/AuthContext'
import PostCard from '@/components/PostCard'
import { 
  MapPinIcon, 
  LinkIcon, 
  CalendarIcon, 
  Edit3Icon, 
  Loader2Icon, 
  MessageSquareIcon,
  HeartIcon,
  MessageCircleIcon,
  UsersIcon,
  UserPlusIcon,
  GridIcon
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

type Tab = 'posts' | 'followers' | 'following'

export default function ProfilePage() {
  const { user_id } = useParams()
  const { user: currentUser } = useAuth()
  
  const [profile, setProfile] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  
  const [activeTab, setActiveTab] = useState<Tab>('posts')
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isOwnProfile = currentUser?.id === user_id

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        const profileRes = await apiClient(`/api/users/${user_id}`)
        if (profileRes.success) setProfile(profileRes.data)

        // Initial tab fetch
        await fetchTabData('posts')

        if (currentUser && !isOwnProfile) {
          const followRes = await apiClient(`/api/users/${currentUser.id}/following`)
          if (followRes.success) {
            setIsFollowing(followRes.data.some((f: any) => f.id === user_id))
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [user_id, currentUser])

  const fetchTabData = async (tab: Tab) => {
    setTabLoading(true)
    try {
      if (tab === 'posts') {
        const res = await apiClient(`/api/posts?author_id=${user_id}`)
        if (res.success) {
          setPosts(res.data.posts || res.data)
        }
      } else if (tab === 'followers') {
        const res = await apiClient(`/api/users/${user_id}/followers`)
        if (res.success) {
          setFollowers(res.data || [])
        }
      } else if (tab === 'following') {
        const res = await apiClient(`/api/users/${user_id}/following`)
        if (res.success) {
          setFollowing(res.data || [])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTabLoading(false)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    fetchTabData(tab)
  }

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setProfile(prev => prev ? { ...prev, posts_count: Math.max(0, prev.posts_count - 1) } : prev)
  }

  const handleFollow = async () => {
    if (followLoading) return
    setFollowLoading(true)
    try {
      const res = await apiClient(`/api/users/${user_id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST'
      })
      if (res.success) {
        setIsFollowing(!isFollowing)
        // Optimistic count update
        setProfile(prev => {
          if (!prev) return null
          return {
            ...prev,
            followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
          }
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2Icon className="animate-spin text-indigo-500" size={32} />
    </div>
  )

  if (!profile) return <div className="text-center py-20 text-slate-400 font-medium">User not found</div>

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4">
      {/* Profile Header */}
      <div className="glass-card overflow-hidden mb-8 border-none bg-slate-900/40">
        <div className="h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-3xl bg-slate-950 border-[6px] border-slate-950 overflow-hidden shadow-2xl relative group">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 text-4xl font-bold">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 mb-2">
              {isOwnProfile ? (
                <Link href="/settings" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center space-x-2">
                  <Edit3Icon size={18} />
                  <span>Edit Profile</span>
                </Link>
              ) : (
                <>
                  {isFollowing && (
                    <Link 
                      href={`/messages/${user_id}`} 
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all active:scale-95 shadow-lg"
                      title="Message"
                    >
                      <MessageSquareIcon size={20} />
                    </Link>
                  )}
                  <button 
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                      isFollowing 
                        ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20' 
                        : 'bg-white text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    {followLoading ? <Loader2Icon size={20} className="animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">{profile.first_name} {profile.last_name}</h1>
                <p className="text-indigo-400 font-medium">@{profile.username}</p>
              </div>
            </div>

            {profile.bio && <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">{profile.bio}</p>}

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {profile.location && (
                <div className="flex items-center space-x-2">
                  <MapPinIcon size={16} className="text-indigo-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center space-x-2">
                  <LinkIcon size={16} className="text-indigo-500" />
                  <a href={profile.website} target="_blank" className="text-indigo-400 hover:underline font-medium">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <CalendarIcon size={16} className="text-indigo-500" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex space-x-12 pt-6 border-t border-slate-800/50">
              <button onClick={() => handleTabChange('posts')} className="flex flex-col group cursor-pointer">
                <span className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{profile.posts_count}</span>
                <span className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">Posts</span>
              </button>
              <button onClick={() => handleTabChange('followers')} className="flex flex-col group cursor-pointer">
                <span className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{profile.followers_count}</span>
                <span className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">Followers</span>
              </button>
              <button onClick={() => handleTabChange('following')} className="flex flex-col group cursor-pointer">
                <span className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{profile.following_count}</span>
                <span className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">Following</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content Tabs */}
      <div className="mb-6 flex border-b border-slate-800/50 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-10 px-2">
        <button 
          onClick={() => handleTabChange('posts')}
          className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all font-bold text-sm uppercase tracking-wider ${
            activeTab === 'posts' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <GridIcon size={18} />
          <span>Posts</span>
        </button>
        <button 
          onClick={() => handleTabChange('followers')}
          className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all font-bold text-sm uppercase tracking-wider ${
            activeTab === 'followers' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <UsersIcon size={18} />
          <span>Followers</span>
        </button>
        <button 
          onClick={() => handleTabChange('following')}
          className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all font-bold text-sm uppercase tracking-wider ${
            activeTab === 'following' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <UserPlusIcon size={18} />
          <span>Following</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {tabLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <Loader2Icon className="animate-spin mb-4" size={32} />
            <p className="font-medium">Loading {activeTab}...</p>
          </div>
        ) : (
          <>
            {activeTab === 'posts' && (
              <div>
                {posts.length === 0 ? (
                  <div className="text-center py-20 glass-card text-slate-500">
                    No posts shared yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 aspect-square shadow-sm hover:-translate-y-1 transition-all"
                      >
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.content || 'Post image'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-4 text-sm text-slate-200 text-center bg-slate-950/80">
                            <span>{post.content || 'Shared a post'}</span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-3 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between text-xs text-slate-100 font-semibold">
                            <span className="flex items-center gap-2">
                              <HeartIcon size={14} />
                              {post.like_count}
                            </span>
                            <span className="flex items-center gap-2">
                              <MessageCircleIcon size={14} />
                              {post.comment_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'followers' || activeTab === 'following') && (
              <div className="space-y-2">
                {(activeTab === 'followers' ? followers : following).length === 0 ? (
                  <div className="text-center py-20 glass-card text-slate-500">
                    No {activeTab} yet.
                  </div>
                ) : (
                  (activeTab === 'followers' ? followers : following).filter(u => u && u.id).map(u => (
                    <Link 
                      key={u.id} 
                      href={`/profile/${u.id}`}
                      className="flex items-center p-4 glass-card hover:bg-slate-800/50 transition-all border-none"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-400 font-bold">{u.username ? u.username[0].toUpperCase() : '?'}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-white">{u.first_name} {u.last_name}</h4>
                        <p className="text-sm text-slate-500">@{u.username}</p>
                      </div>
                      <button className="ml-auto p-2 text-slate-500 hover:text-white transition-colors">
                        <UserPlusIcon size={20} />
                      </button>
                    </Link>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
