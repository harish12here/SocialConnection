'use client'

import React, { useEffect, useState } from 'react'
import { User } from '@/types'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { SearchIcon, UserPlusIcon, Loader2Icon } from 'lucide-react'

export default function DiscoverPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient('/api/users')
        if (res.success) setUsers(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Discover People</h1>
        <p className="text-slate-500 mb-8">Find and connect with other creators</p>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <SearchIcon size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by name or username..."
            className="input-field pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2Icon className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500">
              No users found matching "{search}"
            </div>
          ) : (
            filteredUsers.map(user => (
              <Link 
                key={user.id} 
                href={`/profile/${user.id}`}
                className="glass-card p-4 flex items-center space-x-4 hover:bg-slate-800/50 transition-colors border-transparent hover:border-indigo-500/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl font-bold border border-indigo-500/20">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{user.first_name} {user.last_name}</h3>
                  <p className="text-slate-500 text-sm truncate">@{user.username}</p>
                </div>
                <div className="text-indigo-400">
                  <UserPlusIcon size={20} />
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
