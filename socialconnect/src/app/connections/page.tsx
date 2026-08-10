'use client'

import React, { useState, useEffect } from 'react'
import { User } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/lib/api-client'
import { UserCardSkeleton } from '@/components/SkeletonLoader'
import {
  UsersIcon,
  UserPlusIcon,
  UserCheckIcon,
  UserMinusIcon,
  MessageSquareIcon,
  SparklesIcon,
  ClockIcon,
  SearchIcon,
  CheckIcon,
  XIcon
} from 'lucide-react'
import Link from 'next/link'

type ConnectionTab = 'my-connections' | 'requests' | 'sent' | 'suggestions'

export default function ConnectionsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ConnectionTab>('my-connections')
  const [following, setFollowing] = useState<User[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [followingRes, followersRes, allRes] = await Promise.all([
        apiClient<User[]>(`/api/users/${user.id}/following`),
        apiClient<User[]>(`/api/users/${user.id}/followers`),
        apiClient<User[]>('/api/users')
      ])

      if (followingRes.success) setFollowing(followingRes.data || [])
      if (followersRes.success) setFollowers(followersRes.data || [])
      if (allRes.success) setAllUsers((allRes.data || []).filter((u: User) => u.id !== user.id))
    } catch {
      // ignore error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const followingIds = new Set(following.map(u => u.id))
  const followerIds = new Set(followers.map(u => u.id))

  // Mutual connections = users who follow you AND whom you follow
  const mutualConnections = following.filter(u => followerIds.has(u.id))
  
  // Pending incoming requests = users who follow you but you haven't followed back
  const incomingRequests = followers.filter(u => !followingIds.has(u.id))

  // Suggestions = users you don't follow yet
  const suggestedUsers = allUsers.filter(u => !followingIds.has(u.id))

  const handleFollowToggle = async (targetId: string, isCurrentlyFollowing: boolean) => {
    setActionLoading(prev => ({ ...prev, [targetId]: true }))
    try {
      const res = await apiClient(`/api/users/${targetId}/follow`, {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST'
      })
      if (res.success) {
        if (!isCurrentlyFollowing) {
          // Trigger notification
          apiClient('/api/notifications', {
            method: 'POST',
            body: JSON.stringify({
              user_id: targetId,
              type: 'follow',
              content: 'started following you'
            })
          }).catch(() => {})
        }
        await fetchData()
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(prev => ({ ...prev, [targetId]: false }))
    }
  }

  const filterUserList = (list: User[]) => {
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(u =>
      u.username.toLowerCase().includes(q) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-xl skeleton-shimmer mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Page Header */}
      <header className="mb-8 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
              <UsersIcon className="text-indigo-500" size={32} />
              <span>Connections Hub</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage your network, friend requests, and creator relationships.</p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search connections..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('my-connections')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'my-connections'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <UserCheckIcon size={16} />
            <span>Connected ({following.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 relative ${
              activeTab === 'requests'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <ClockIcon size={16} />
            <span>Requests ({incomingRequests.length})</span>
            {incomingRequests.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'suggestions'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <SparklesIcon size={16} />
            <span>Suggestions ({suggestedUsers.length})</span>
          </button>
        </div>
      </header>

      {/* Tab Panels */}
      <div>
        {activeTab === 'my-connections' && (
          <div>
            {filterUserList(following).length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500">
                <UsersIcon size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="font-semibold text-slate-300">No connections yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Start following creators to build your professional and personal network.</p>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className="btn-primary text-xs"
                >
                  Explore Suggestions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterUserList(following).map(u => {
                  const isMutual = followerIds.has(u.id)
                  const isBusy = !!actionLoading[u.id]
                  return (
                    <div key={u.id} className="glass-card p-4 flex items-center justify-between space-x-3 border border-slate-800/60">
                      <Link href={`/profile/${u.id}`} className="flex items-center space-x-3 min-w-0 flex-1 group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-slate-700 overflow-hidden flex items-center justify-center text-indigo-400 font-bold flex-shrink-0 group-hover:border-indigo-500 transition-colors">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            u.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                              {u.first_name} {u.last_name}
                            </h3>
                            {isMutual && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                                Mutual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                        </div>
                      </Link>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/messages/${u.id}`}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Message"
                        >
                          <MessageSquareIcon size={18} />
                        </Link>
                        <button
                          onClick={() => handleFollowToggle(u.id, true)}
                          disabled={isBusy}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                          title="Remove Connection"
                        >
                          <UserMinusIcon size={18} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {filterUserList(incomingRequests).length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500">
                <ClockIcon size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="font-semibold text-slate-300">No pending connection requests</p>
                <p className="text-xs text-slate-500 mt-1">When someone follows you, they will appear here as connection requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterUserList(incomingRequests).map(u => {
                  const isBusy = !!actionLoading[u.id]
                  return (
                    <div key={u.id} className="glass-card p-4 flex items-center justify-between space-x-3 border border-indigo-500/30 bg-indigo-500/5">
                      <Link href={`/profile/${u.id}`} className="flex items-center space-x-3 min-w-0 flex-1 group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 overflow-hidden flex items-center justify-center text-indigo-400 font-bold flex-shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            u.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                            {u.first_name} {u.last_name}
                          </h3>
                          <p className="text-xs text-slate-400 truncate">Follows you · @{u.username}</p>
                        </div>
                      </Link>

                      <button
                        onClick={() => handleFollowToggle(u.id, false)}
                        disabled={isBusy}
                        className="btn-primary text-xs py-2 px-3 flex items-center space-x-1.5"
                      >
                        <CheckIcon size={16} />
                        <span>Accept</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div>
            {filterUserList(suggestedUsers).length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500">
                <SparklesIcon size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="font-semibold text-slate-300">No suggestions found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterUserList(suggestedUsers).map(u => {
                  const isBusy = !!actionLoading[u.id]
                  return (
                    <div key={u.id} className="glass-card p-4 flex items-center justify-between space-x-3 border border-slate-800/60">
                      <Link href={`/profile/${u.id}`} className="flex items-center space-x-3 min-w-0 flex-1 group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-slate-700 overflow-hidden flex items-center justify-center text-indigo-400 font-bold flex-shrink-0 group-hover:border-indigo-500 transition-colors">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            u.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                            {u.first_name} {u.last_name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                          {u.bio && <p className="text-xs text-slate-400 truncate mt-0.5">{u.bio}</p>}
                        </div>
                      </Link>

                      <button
                        onClick={() => handleFollowToggle(u.id, false)}
                        disabled={isBusy}
                        className="btn-primary text-xs py-2 px-3 flex items-center space-x-1.5"
                      >
                        <UserPlusIcon size={16} />
                        <span>Connect</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
