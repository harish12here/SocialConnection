'use client'

import React, { useState, useEffect } from 'react'
import { User, Message } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'
import { SearchIcon, Loader2Icon, MessageSquareIcon, UserIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'

type Conversation = {
  partner: User
  lastMessage: Message
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conversationsRes, followingRes] = await Promise.all([
          apiClient<Conversation[]>('/api/messages'),
          apiClient<User[]>(`/api/users/${user?.id}/following`)
        ])

        if (conversationsRes.success) {
          setConversations(conversationsRes.data || [])
        } else {
          setError(conversationsRes.message)
        }

        if (followingRes.success) {
          setFollowing((followingRes.data || []).filter((u: User) => u.id !== user?.id))
        }
      } catch {
        setError('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

  const filteredConversations = conversations.filter(c =>
    `${c.partner.first_name} ${c.partner.last_name}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.partner.username.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const filteredFollowing = following.filter(f =>
    `${f.first_name} ${f.last_name}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.username.toLowerCase().includes(searchFilter.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2Icon className="animate-spin mb-4 text-indigo-500" size={32} />
        <p>Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="grid h-[calc(100vh-6rem)] gap-4 md:gap-6 md:grid-cols-[340px_1fr]">
      
      {/* Conversations & Following List (Full Screen on Mobile) */}
      <aside className="glass-card border border-slate-800/80 bg-slate-950/90 shadow-xl p-5 flex flex-col h-full overflow-hidden">
        
        {/* Header & Search */}
        <div className="mb-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white tracking-tight">Messages</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {conversations.length} Chats
            </span>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          
          {/* Recent Conversations */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-3">
              Recent Chats
            </span>

            {filteredConversations.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-slate-500 text-xs text-center">
                {searchFilter ? 'No matching chats' : 'No recent chats yet'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <Link
                    key={conv.partner.id}
                    href={`/messages/${conv.partner.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-3 transition hover:border-indigo-500/60 hover:bg-slate-900 group"
                  >
                    <div className="h-11 w-11 rounded-2xl overflow-hidden bg-indigo-500/10 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-colors">
                      {conv.partner.avatar_url ? (
                        <img src={conv.partner.avatar_url} alt={conv.partner.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-indigo-400 font-bold text-base">{conv.partner.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {conv.partner.first_name} {conv.partner.last_name}
                      </p>
                      <p className="truncate text-[11px] text-slate-400 mt-0.5">{conv.lastMessage.content}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Following Creators */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-3">
              Network Connections
            </span>

            {filteredFollowing.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-slate-500 text-xs text-center">
                Follow creators to start chatting
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFollowing.map((person) => (
                  <Link
                    key={person.id}
                    href={`/messages/${person.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-3 transition hover:border-indigo-500/60 hover:bg-slate-900 group"
                  >
                    <div className="h-11 w-11 rounded-2xl overflow-hidden bg-indigo-500/10 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-colors">
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt={person.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-indigo-400 font-bold text-base">{person.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {person.first_name} {person.last_name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">@{person.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* Desktop Chat Placeholder (Hidden on Mobile) */}
      <section className="hidden md:flex glass-card border border-slate-800/80 bg-slate-950/90 p-10 flex-col justify-center items-center text-center h-full">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
          <MessageSquareIcon size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Select a Conversation</h2>
        <p className="text-slate-400 text-sm max-w-md">
          Choose someone from your network on the left to start messaging, voice calling, or video calling.
        </p>
      </section>

    </div>
  )
}
