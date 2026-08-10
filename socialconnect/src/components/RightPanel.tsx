'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'
import { UserPlusIcon, UserCheckIcon, TrendingUpIcon, SparklesIcon, Loader2Icon } from 'lucide-react'

import { usePathname } from 'next/navigation'

export default function RightPanel() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user || pathname.startsWith('/messages')) return
    const fetchSuggestions = async () => {
      try {
        const res = await apiClient('/api/users')
        if (res.success) {
          // Filter out current user & limit to 5
          const others = (res.data || []).filter((u: User) => u.id !== user.id).slice(0, 4)
          setSuggestions(others)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [user, pathname])

  const handleFollowToggle = async (targetId: string) => {
    const currentlyFollowing = !!followingMap[targetId]
    setFollowingMap(prev => ({ ...prev, [targetId]: !currentlyFollowing }))
    try {
      await apiClient(`/api/users/${targetId}/follow`, {
        method: currentlyFollowing ? 'DELETE' : 'POST'
      })
    } catch {
      // rollback
      setFollowingMap(prev => ({ ...prev, [targetId]: currentlyFollowing }))
    }
  }

  if (!user || pathname.startsWith('/messages')) return null

  return (
    <aside className="hidden xl:block w-80 shrink-0 p-6 space-y-6">
      
      {/* Suggested People Card */}
      <div className="glass-card p-5 border border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SparklesIcon size={18} className="text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Suggested Creators</h3>
          </div>
          <Link href="/discover" className="text-xs font-semibold text-indigo-400 hover:underline">
            See All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2Icon className="animate-spin text-indigo-500" size={20} />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No suggestions right now</p>
        ) : (
          <div className="space-y-3.5">
            {suggestions.map((u) => {
              const isFollowing = !!followingMap[u.id]
              return (
                <div key={u.id} className="flex items-center justify-between space-x-3">
                  <Link href={`/profile/${u.id}`} className="flex items-center space-x-3 min-w-0 flex-1 group">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-indigo-400 font-bold flex-shrink-0 group-hover:border-indigo-500 transition-colors">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                      ) : (
                        u.username[0].toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">@{u.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(u.id)}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    }`}
                    title={isFollowing ? 'Unfollow' : 'Follow'}
                  >
                    {isFollowing ? <UserCheckIcon size={16} /> : <UserPlusIcon size={16} />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Trending Network Topics */}
      <div className="glass-card p-5 border border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUpIcon size={18} className="text-rose-400" />
          <h3 className="font-bold text-white text-sm">Trending Topics</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-indigo-500/40 transition-colors cursor-pointer">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Technology · Trending</span>
            <p className="font-bold text-slate-200 mt-0.5">#NextJS16 & Turbopack</p>
            <span className="text-[11px] text-slate-500">2.4k posts</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-indigo-500/40 transition-colors cursor-pointer">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Design · Trending</span>
            <p className="font-bold text-slate-200 mt-0.5">#ModernSocialConnect</p>
            <span className="text-[11px] text-slate-500">1.8k posts</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-indigo-500/40 transition-colors cursor-pointer">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Community · Trending</span>
            <p className="font-bold text-slate-200 mt-0.5">#WebDevelopment2026</p>
            <span className="text-[11px] text-slate-500">950 posts</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-slate-600 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <span>·</span>
          <Link href="/settings" className="hover:underline">Settings</Link>
        </div>
        <p>© 2026 SocialConnect Inc. All rights reserved.</p>
      </div>

    </aside>
  )
}
