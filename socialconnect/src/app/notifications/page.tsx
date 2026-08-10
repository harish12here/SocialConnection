'use client'

import React, { useEffect, useState } from 'react'
import { Notification, NotificationType } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/AuthContext'
import {
  BellIcon,
  HeartIcon,
  MessageCircleIcon,
  UserPlusIcon,
  MessageSquareIcon,
  CheckCheckIcon,
  Loader2Icon,
  Trash2Icon,
  SparklesIcon,
} from 'lucide-react'
import Link from 'next/link'

type FilterTab = 'all' | 'unread' | 'likes' | 'comments' | 'follows'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const fetchNotifications = async () => {
    try {
      const res = await apiClient('/api/notifications')
      if (res.success) {
        setNotifications(res.data || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const handleMarkRead = async (id?: string) => {
    try {
      await apiClient('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify(id ? { id } : {})
      })
      if (id) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      }
    } catch {
      // ignore
    }
  }

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read
    if (activeTab === 'likes') return n.type === 'like'
    if (activeTab === 'comments') return n.type === 'comment'
    if (activeTab === 'follows') return n.type === 'follow'
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <HeartIcon size={18} className="text-rose-500 fill-rose-500" />
      case 'comment':
        return <MessageCircleIcon size={18} className="text-indigo-400" />
      case 'follow':
        return <UserPlusIcon size={18} className="text-emerald-400" />
      case 'message':
        return <MessageSquareIcon size={18} className="text-purple-400" />
      default:
        return <SparklesIcon size={18} className="text-amber-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2Icon className="animate-spin mb-4 text-indigo-500" size={32} />
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
              <BellIcon className="text-indigo-500" size={32} />
              <span>Notifications Center</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Stay updated with interactions across your network.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => handleMarkRead()}
              className="btn-secondary flex items-center space-x-2 text-xs self-start sm:self-auto"
            >
              <CheckCheckIcon size={16} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
          {(['all', 'unread', 'likes', 'comments', 'follows'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {tab} {tab === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>
      </header>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500">
            <BellIcon size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="font-semibold text-slate-300">No notifications in {activeTab}</p>
            <p className="text-xs text-slate-500 mt-1">When people like your posts, follow you, or comment, they will appear here.</p>
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`glass-card p-4 flex items-center justify-between gap-4 transition-all cursor-pointer border ${
                !n.is_read
                  ? 'border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                  : 'border-slate-800/60 hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                {/* Actor Avatar */}
                <Link href={`/profile/${n.actor_id}`} onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {n.actor?.avatar_url ? (
                      <img src={n.actor.avatar_url} alt={n.actor.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-indigo-400 font-bold">{n.actor?.username?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                      {getNotifIcon(n.type)}
                    </span>
                    <p className="text-sm text-slate-200 leading-snug">
                      <Link href={`/profile/${n.actor_id}`} className="font-bold text-white hover:underline" onClick={e => e.stopPropagation()}>
                        {n.actor?.first_name} {n.actor?.last_name}
                      </Link>{' '}
                      {n.content}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action link if entity exists */}
              {n.entity_id && (
                <Link
                  href={`/posts/${n.entity_id}`}
                  onClick={e => e.stopPropagation()}
                  className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                >
                  View
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
