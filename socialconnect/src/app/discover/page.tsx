'use client'

import React, { useEffect, useState } from 'react'
import { User } from '@/types'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'
import { UserCardSkeleton } from '@/components/SkeletonLoader'
import { SearchIcon, UserPlusIcon, UserCheckIcon, MapPinIcon, CompassIcon, SparklesIcon } from 'lucide-react'

export default function DiscoverPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient<User[]>('/api/users')
        if (res.success) {
          const list = (res.data || []).filter((u: User) => u.id !== currentUser?.id)
          setUsers(list)
        }

        if (currentUser) {
          const followRes = await apiClient<User[]>(`/api/users/${currentUser.id}/following`)
          if (followRes.success) {
            const map: Record<string, boolean> = {}
            ;(followRes.data || []).forEach((u: User) => {
              map[u.id] = true
            })
            setFollowingMap(map)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [currentUser])

  const handleFollowToggle = async (targetId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentlyFollowing = !!followingMap[targetId]
    setFollowingMap(prev => ({ ...prev, [targetId]: !currentlyFollowing }))
    try {
      await apiClient(`/api/users/${targetId}/follow`, {
        method: currentlyFollowing ? 'DELETE' : 'POST'
      })
      if (!currentlyFollowing) {
        apiClient('/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            user_id: targetId,
            type: 'follow',
            content: 'started following you'
          })
        }).catch(() => {})
      }
    } catch {
      setFollowingMap(prev => ({ ...prev, [targetId]: currentlyFollowing }))
    }
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (u.bio && u.bio.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Community</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3 mt-1">
            <CompassIcon className="text-indigo-500" size={32} />
            <span>Discover Creators & Friends</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Connect with interesting people and expand your network.</p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, @username, or bio keywords..."
            className="input-field pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
          <UserCardSkeleton />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <SparklesIcon size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="font-semibold text-slate-300">No creators found matching "{search}"</p>
          <p className="text-xs text-slate-500 mt-1">Try searching for a different name or keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(user => {
            const isFollowing = !!followingMap[user.id]
            return (
              <Link 
                key={user.id} 
                href={`/profile/${user.id}`}
                className="glass-card p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all border border-slate-800/60 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-slate-700 flex items-center justify-center text-indigo-400 text-xl font-bold overflow-hidden flex-shrink-0 group-hover:border-indigo-500 transition-colors">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base truncate group-hover:text-indigo-400 transition-colors">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-slate-500 text-xs truncate">@{user.username}</p>
                    
                    {user.location && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                        <MapPinIcon size={12} className="text-indigo-400" />
                        <span>{user.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {user.bio}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-500 font-medium">
                    {user.followers_count || 0} followers
                  </span>

                  <button
                    onClick={(e) => handleFollowToggle(user.id, e)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                        : 'btn-primary'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheckIcon size={16} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlusIcon size={16} />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
