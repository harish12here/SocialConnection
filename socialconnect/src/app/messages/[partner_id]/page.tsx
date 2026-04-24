'use client'

import React, { useState, useEffect, useRef } from 'react'
import { User, Message } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeftIcon, Loader2Icon, SendIcon, UserIcon, PhoneIcon, VideoIcon, MoreHorizontalIcon } from 'lucide-react'
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
          apiClient(`/api/users/${partner_id}`),
          apiClient(`/api/messages/${partner_id}`),
          apiClient('/api/messages/recent')
        ])

        if (partnerRes.success) setPartner(partnerRes.data)
        if (messagesRes.success) setMessages(messagesRes.data)
        if (recentRes.success) setConversations(recentRes.data)
        if (!messagesRes.success) setError(messagesRes.message)
      } catch (err) {
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
        const res = await apiClient(`/api/calls/${activeCall.id}`)
        if (res.success) {
          const status = res.data.status
          if (status === 'accepted' && activeCall.status !== 'connected') {
            setActiveCall(prev => prev ? { ...prev, status: 'connected' } : prev)
          }
          if (status === 'ended' && activeCall.status !== 'disconnected') {
            setActiveCall(prev => prev ? { ...prev, status: 'disconnected' } : prev)
          }
        }
      } catch (err) {
        console.error('Call polling failed', err)
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

  const forwardMessage = (content: string) => {
    alert('Forward feature is coming soon')
    setSelectedMessageId(null)
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
      const res = await apiClient('/api/calls', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: partner_id, type })
      })
      if (res.success) {
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
      const res = await apiClient('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: partner_id, content: input.trim() })
      })
      if (res.success) {
        setMessages(prev => [...prev, res.data])
        setInput('')
        scrollToBottom()
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
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] h-[calc(100vh-140px)]">
      <aside className="glass-card border border-slate-800/70 bg-slate-950/90 shadow-xl shadow-black/20 p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Chats</h2>
            <p className="text-sm text-slate-500">Tap any conversation to continue.</p>
          </div>
          <span className="text-slate-500 text-sm">{messages.length} msgs</span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-260px)] pr-2">
          {conversations.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 p-5 text-slate-500 text-sm">
              No recent chats available.
            </div>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-3 transition hover:border-indigo-500/60 hover:bg-slate-900"
              >
                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {conv.avatar_url ? (
                    <img src={conv.avatar_url} alt={conv.username} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="text-slate-500" size={24} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{conv.first_name} {conv.last_name}</p>
                  <p className="truncate text-xs text-slate-500">@{conv.username}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </aside>

      <div className="flex flex-col glass-card border border-slate-800/70 bg-slate-950/90 shadow-xl shadow-black/20 overflow-hidden">
        {error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}
        <div className="flex items-center justify-between border-b border-slate-800/70 p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-2xl bg-slate-900 text-slate-400 hover:text-white transition">
              <ArrowLeftIcon size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                {partner?.avatar_url ? (
                  <img src={partner.avatar_url} alt={partner?.username} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="text-slate-500" size={24} />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{partner?.first_name} {partner?.last_name}</h2>
                <p className="text-xs text-slate-500">Active now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleInitiateCall('audio')}
              className="p-3 rounded-2xl bg-slate-900 text-slate-400 hover:text-white transition"
              title="Voice call"
            >
              <PhoneIcon size={18} />
            </button>
            <button
              onClick={() => handleInitiateCall('video')}
              className="p-3 rounded-2xl bg-slate-900 text-slate-400 hover:text-white transition"
              title="Video call"
            >
              <VideoIcon size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-800/60 bg-slate-900/80 p-8 text-center text-slate-500">
              No messages yet. Send the first message to start the conversation.
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id
            const isPinned = pinnedMessages.includes(msg.id)

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[80%] rounded-3xl border px-4 py-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white border-indigo-500/40 rounded-br-none' : 'bg-slate-800 text-slate-100 border-slate-700 rounded-bl-none'}`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{isMe ? 'You' : partner?.first_name}</span>
                      {isPinned && <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] text-indigo-200">Pinned</span>}
                    </div>
                    <button
                      onClick={() => setSelectedMessageId(prev => (prev === msg.id ? null : msg.id))}
                      className="text-slate-400 hover:text-white transition"
                      aria-label="Message options"
                    >
                      <MoreHorizontalIcon size={18} />
                    </button>
                  </div>

                  {editingMessageId === msg.id ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-3 text-sm text-white outline-none"
                        rows={3}
                        value={editedMessageText}
                        onChange={(e) => setEditedMessageText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          type="button"
                          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                        >Cancel</button>
                        <button
                          onClick={handleMessageEditSave}
                          type="button"
                          className="rounded-full bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400"
                        >Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-6">{msg.content}</p>
                      <div className={`mt-2 text-[10px] opacity-80 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  )}

                  {selectedMessageId === msg.id && editingMessageId !== msg.id && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-3xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                      {isMe && (
                        <button onClick={() => startMessageEdit(msg)} className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Edit</button>
                      )}
                      <button onClick={() => copyMessage(msg.content)} className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Copy</button>
                      <button onClick={() => pinMessage(msg.id)} className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">{isPinned ? 'Unpin' : 'Pin'}</button>
                      {isMe && (
                        <button onClick={() => deleteMessage(msg.id)} className="w-full rounded-2xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-slate-800">Delete</button>
                      )}
                      <button onClick={() => forwardMessage(msg.content)} className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Forward</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-800/70 p-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="rounded-3xl bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-500 disabled:bg-slate-800"
            >
              {sending ? <Loader2Icon className="animate-spin" size={20} /> : <SendIcon size={20} />}
            </button>
          </div>
        </form>
      </div>

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
