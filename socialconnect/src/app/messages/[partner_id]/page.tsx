'use client'

import React, { useState, useEffect, useRef } from 'react'
import { User, Message } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeftIcon, Loader2Icon, SendIcon, PhoneIcon, VideoIcon, MoreHorizontalIcon, SearchIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import CallOverlay from '@/components/CallOverlay'

export default function ChatPage() {
  const { partner_id } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const [partner, setPartner] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedMessageText, setEditedMessageText] = useState('')
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([])
  const [activeCall, setActiveCall] = useState<{ id: string | null; type: 'audio' | 'video'; status: 'calling' | 'ringing' | 'connected' | 'disconnected'; isIncoming: boolean } | null>(null)
  const [error, setError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const [partnerRes, messagesRes, recentRes] = await Promise.all([
          apiClient<User>(`/api/users/${partner_id}`),
          apiClient<Message[]>(`/api/messages/${partner_id}`),
          apiClient<User[]>('/api/messages/recent')
        ])

        if (partnerRes.success) setPartner(partnerRes.data || null)
        if (messagesRes.success) setMessages(messagesRes.data || [])
        if (recentRes.success) setConversations(recentRes.data || [])
        if (!messagesRes.success) setError(messagesRes.message)
      } catch {
        setError('Failed to load chat history')
      } finally {
        setLoading(false)
        setTimeout(scrollToBottom, 100)
      }
    }

    if (user && partner_id) fetchChatData()
  }, [user, partner_id])

  useEffect(() => {
    if (!user || !activeCall?.id) return

    const interval = setInterval(async () => {
      try {
        const res = await apiClient<{ status: string }>(`/api/calls/${activeCall.id}`)
        if (res.success && res.data) {
          const status = res.data.status
          if (status === 'accepted' && activeCall.status !== 'connected') {
            setActiveCall(prev => prev ? { ...prev, status: 'connected' } : prev)
          }
          if (status === 'ended' && activeCall.status !== 'disconnected') {
            setActiveCall(prev => prev ? { ...prev, status: 'disconnected' } : prev)
          }
        }
      } catch {
        // ignore
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user, activeCall])

  const startMessageEdit = (msg: Message) => {
    setEditingMessageId(msg.id)
    setEditedMessageText(msg.content)
    setSelectedMessageId(null)
  }

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content)
    alert('Message copied')
    setSelectedMessageId(null)
  }

  const pinMessage = (messageId: string) => {
    setPinnedMessages(prev => prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId])
    setSelectedMessageId(null)
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    setSelectedMessageId(null)
    try {
      await apiClient(`/api/messages/${messageId}`, { method: 'DELETE' })
    } catch {
      alert('Could not delete message')
    }
  }

  const handleMessageEditSave = async () => {
    if (!editingMessageId || !editedMessageText.trim()) return
    setMessages(prev => prev.map(msg => msg.id === editingMessageId ? { ...msg, content: editedMessageText.trim() } : msg))
    setEditingMessageId(null)
    try {
      await apiClient(`/api/messages/${editingMessageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editedMessageText.trim() })
      })
    } catch {
      alert('Failed to save changes')
    }
  }

  const handleInitiateCall = async (type: 'audio' | 'video') => {
    try {
      const res = await apiClient<{ id: string }>('/api/calls', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: partner_id, type })
      })
      if (res.success && res.data) {
        setActiveCall({ id: res.data.id, type, status: 'calling', isIncoming: false })
      } else {
        alert(res.message)
      }
    } catch {
      alert('Failed to start call')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    try {
      const res = await apiClient<Message>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: partner_id, content: input.trim() })
      })
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data!])
        setInput('')
        setTimeout(scrollToBottom, 50)
      } else {
        alert(res.message)
      }
    } catch {
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2Icon className="animate-spin text-indigo-500" size={32} />
      </div>
    )
  }

  return (
    <div className="grid h-[calc(100vh-5.5rem)] gap-4 md:grid-cols-[320px_1fr]">
      
      {/* Chats Sidebar (Desktop Only) */}
      <aside className="hidden md:flex flex-col glass-card border border-slate-800/80 bg-slate-950/90 shadow-xl p-5 overflow-hidden h-full">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Conversations</h2>
            <p className="text-xs text-slate-500">Active network chats</p>
          </div>
          <Link href="/messages" className="text-xs text-indigo-400 font-semibold hover:underline">
            All
          </Link>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-slate-500 text-xs text-center">
              No recent chats
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.id === partner_id
              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                    isSelected
                      ? 'border-indigo-500/50 bg-indigo-600/15 text-white'
                      : 'border-slate-800/60 bg-slate-900/60 text-slate-300 hover:border-indigo-500/30 hover:bg-slate-900'
                  }`}
                >
                  <div className="h-10 w-10 rounded-2xl overflow-hidden bg-indigo-500/10 border border-slate-700 flex items-center justify-center shrink-0">
                    {conv.avatar_url ? (
                      <img src={conv.avatar_url} alt={conv.username} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-indigo-400 font-bold text-sm">{conv.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">{conv.first_name} {conv.last_name}</p>
                    <p className="truncate text-[11px] text-slate-500">@{conv.username}</p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </aside>

      {/* Active Main Chat Section (Full Width on Mobile) */}
      <div className="flex flex-col glass-card border border-slate-800/80 bg-slate-950/90 shadow-xl overflow-hidden h-full">
        
        {error && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-300 px-4 py-2.5 text-xs font-medium shrink-0">
            {error}
          </div>
        )}

        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 p-3 sm:p-4 bg-slate-900/40 shrink-0">
          <div className="flex items-center space-x-3">
            <Link
              href="/messages"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Back to conversations"
            >
              <ArrowLeftIcon size={18} />
            </Link>

            <Link href={`/profile/${partner_id}`} className="flex items-center space-x-3 group">
              <div className="h-11 w-11 rounded-2xl overflow-hidden bg-indigo-500/10 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-colors">
                {partner?.avatar_url ? (
                  <img src={partner.avatar_url} alt={partner?.username} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-indigo-400 font-bold text-lg">{partner?.username?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {partner?.first_name} {partner?.last_name}
                </h2>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online · @{partner?.username}</span>
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleInitiateCall('audio')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Voice call"
            >
              <PhoneIcon size={18} />
            </button>
            <button
              onClick={() => handleInitiateCall('video')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Video call"
            >
              <VideoIcon size={18} />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/40 p-8 text-center text-slate-500 text-xs my-auto">
              No messages yet. Send a message to start conversing!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id
              const isPinned = pinnedMessages.includes(msg.id)

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs md:text-sm shadow-md ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                          {isMe ? 'You' : partner?.first_name}
                        </span>
                        {isPinned && (
                          <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                            Pinned
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedMessageId(prev => (prev === msg.id ? null : msg.id))}
                        className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
                        aria-label="Message options"
                      >
                        <MoreHorizontalIcon size={16} />
                      </button>
                    </div>

                    {editingMessageId === msg.id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none"
                          rows={2}
                          value={editedMessageText}
                          onChange={(e) => setEditedMessageText(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            type="button"
                            className="rounded-xl border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                          >Cancel</button>
                          <button
                            onClick={handleMessageEditSave}
                            type="button"
                            className="rounded-xl bg-indigo-500 px-3 py-1 text-xs text-white font-bold hover:bg-indigo-400"
                          >Save</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <div className={`mt-1 text-[9px] opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    )}

                    {/* Quick Options Popup */}
                    {selectedMessageId === msg.id && editingMessageId !== msg.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 rounded-2xl border border-slate-700 bg-slate-950 p-1.5 shadow-2xl z-50">
                        {isMe && (
                          <button onClick={() => startMessageEdit(msg)} className="w-full rounded-xl px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800">Edit</button>
                        )}
                        <button onClick={() => copyMessage(msg.content)} className="w-full rounded-xl px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800">Copy</button>
                        <button onClick={() => pinMessage(msg.id)} className="w-full rounded-xl px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800">{isPinned ? 'Unpin' : 'Pin'}</button>
                        {isMe && (
                          <button onClick={() => deleteMessage(msg.id)} className="w-full rounded-xl px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10">Delete</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="border-t border-slate-800/80 p-3 sm:p-4 bg-slate-950/95 shrink-0">
          <div className="flex items-center space-x-2.5">
            <input
              type="text"
              placeholder={`Message ${partner?.first_name || ''}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-w-0 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="btn-primary shrink-0 px-4 py-3 flex items-center justify-center disabled:opacity-50"
              title="Send message"
            >
              {sending ? <Loader2Icon className="animate-spin" size={18} /> : <SendIcon size={18} />}
            </button>
          </div>
        </form>

      </div>

      {/* WebRTC Overlay */}
      {activeCall && (
        <CallOverlay
          callId={activeCall.id}
          partner={partner}
          type={activeCall.type}
          isIncoming={activeCall.isIncoming}
          onClose={() => setActiveCall(null)}
        />
      )}

    </div>
  )
}
