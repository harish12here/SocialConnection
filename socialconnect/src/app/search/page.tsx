'use client'

import React, { useState, useEffect } from 'react'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'
import { SearchIcon, Loader2Icon, UserPlusIcon, UserCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch()
      } else if (query.length === 0) {
        setUsers([])
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await apiClient(`/api/users?q=${encodeURIComponent(query)}`)
      if (res.success) {
        setUsers(res.data)
      }
    } catch (err) {
      console.error('Search failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Explore</h1>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search for people by name or username..."
            className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2Icon className="animate-spin mb-4" size={32} />
            <p>Searching for creators...</p>
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <Link 
              key={user.id} 
              href={`/profile/${user.id}`}
              className="flex items-center justify-between p-4 glass-card hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center overflow-hidden border border-slate-700">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-indigo-400">{user.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-slate-400 text-sm">@{user.username}</p>
                  {user.bio && (
                    <p className="text-slate-500 text-sm mt-1 line-clamp-1">{user.bio}</p>
                  )}
                </div>
              </div>
              
              <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <UserPlusIcon size={20} />
              </div>
            </Link>
          ))
        ) : query.length >= 2 ? (
          <div className="text-center py-20 glass-card">
            <p className="text-slate-400">No users found matching "{query}"</p>
          </div>
        ) : (
          <div className="text-center py-20 glass-card">
            <p className="text-slate-500">Start typing to discover people on SocialConnect</p>
          </div>
        )}
      </div>
    </div>
  )
}
