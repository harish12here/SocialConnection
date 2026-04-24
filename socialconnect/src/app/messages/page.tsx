'use client'

import React, { useState, useEffect } from 'react'
import { User, Message } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'
import { SearchIcon, Loader2Icon, MessageSquareIcon, UserIcon } from 'lucide-react'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conversationsRes, followingRes] = await Promise.all([
          apiClient('/api/messages'),
          apiClient(`/api/users/${user?.id}/following`)
        ])

        if (conversationsRes.success) {
          setConversations(conversationsRes.data)
        } else {
          setError(conversationsRes.message)
        }

        if (followingRes.success) {
          setFollowing(followingRes.data.filter((u: User) => u.id !== user?.id))
        }
      } catch (err) {
        setError('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2Icon className="animate-spin mb-4" size={32} />
        <p>Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[360px_1fr] pb-20 px-4">
      <aside className="glass-card border border-slate-800/70 bg-slate-950/80 shadow-xl shadow-black/20 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Messages</h1>
            <p className="text-sm text-slate-500">Chat with people you follow.</p>
          </div>
          <SearchIcon className="text-slate-400" size={20} />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">Recent</h2>
            {conversations.length === 0 ? (
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 p-5 text-slate-500 text-sm">
                No recent chats yet.
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <Link
                    key={conv.partner.id}
                    href={`/messages/${conv.partner.id}`}
                    className="flex items-center gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-3 transition hover:border-indigo-500/60 hover:bg-slate-900"
                  >
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                      {conv.partner.avatar_url ? (
                        <img src={conv.partner.avatar_url} alt={conv.partner.username} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="text-slate-500" size={24} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{conv.partner.first_name} {conv.partner.last_name}</p>
                      <p className="truncate text-xs text-slate-500">{conv.lastMessage.content}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">Following</h2>
            {following.length === 0 ? (
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 p-5 text-slate-500 text-sm">
                Follow people to start a chat.
              </div>
            ) : (
              <div className="space-y-3">
                {following.map((person) => (
                  <Link
                    key={person.id}
                    href={`/messages/${person.id}`}
                    className="flex items-center gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-3 transition hover:border-indigo-500/60 hover:bg-slate-900"
                  >
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt={person.username} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="text-slate-500" size={24} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{person.first_name} {person.last_name}</p>
                      <p className="truncate text-xs text-slate-500">@{person.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      <section className="glass-card border border-slate-800/70 bg-slate-950/80 shadow-xl shadow-black/20 p-10 flex flex-col justify-center items-center text-center">
        <MessageSquareIcon className="mb-4 text-indigo-400" size={40} />
        <h2 className="text-2xl font-semibold text-white mb-2">Select a chat</h2>
        <p className="text-slate-500 max-w-xl">
          Conversation previews live on the left. Choose someone you follow to start messaging, calling, and sharing media.
        </p>
      </section>
    </div>
  )
}
