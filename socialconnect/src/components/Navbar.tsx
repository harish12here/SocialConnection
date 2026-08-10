'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import {
  SearchIcon,
  BellIcon,
  UsersIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  MessageSquareIcon,
  SparklesIcon,
  CheckCheckIcon,
  XIcon,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Notification, User } from '@/types'

export default function Navbar() {
  const { user, logout } = useAuth()

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  // Notifications popover state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // User menu dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced instant search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true)
        try {
          const res = await apiClient(`/api/users?q=${encodeURIComponent(searchQuery.trim())}`)
          if (res.success) {
            setSearchResults(res.data || [])
            setShowSearchDropdown(true)
          }
        } catch {
          // ignore error
        } finally {
          setSearchLoading(false)
        }
      } else {
        setSearchResults([])
        setShowSearchDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch unread notifications periodically
  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const res = await apiClient('/api/notifications')
        if (res.success) {
          setNotifications(res.data || [])
          setUnreadCount((res.data || []).filter((n: Notification) => !n.is_read).length)
        }
      } catch {
        // ignore error
      }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [user])

  const handleMarkAllRead = async () => {
    try {
      await apiClient('/api/notifications', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo (Visible on all sizes, optimized for desktop header) */}
        <div className="flex items-center space-x-3">
          <Link href="/feed" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <SparklesIcon size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent hidden sm:inline-block">
              SocialConnect
            </span>
          </Link>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative flex-1 max-w-md mx-4 sm:mx-8" ref={searchRef}>
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search people, tags, creators..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-indigo-500/60 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
              <div className="p-2">
                {searchLoading ? (
                  <div className="p-4 text-center text-sm text-slate-500">Searching creators...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No creators found matching &quot;{searchQuery}&quot;</div>
                ) : (
                  <div>
                    <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">People</div>
                    {searchResults.slice(0, 5).map((u) => (
                      <Link
                        key={u.id}
                        href={`/profile/${u.id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center space-x-3 rounded-xl p-2.5 transition-colors hover:bg-slate-800/80"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-indigo-400 font-bold overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.username} className="h-full w-full object-cover" />
                          ) : (
                            u.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{u.first_name} {u.last_name}</p>
                          <p className="truncate text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowSearchDropdown(false)}
                className="block border-t border-slate-800 bg-slate-950/50 p-2.5 text-center text-xs font-semibold text-indigo-400 hover:bg-slate-800/50"
              >
                View all results for &quot;{searchQuery}&quot;
              </Link>
            </div>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Quick Connections Button */}
          <Link
            href="/connections"
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-white"
            title="Connections"
          >
            <UsersIcon size={20} />
          </Link>

          {/* Notifications Popover Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-white"
              aria-label="Notifications"
            >
              <BellIcon size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Box */}
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 p-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      <CheckCheckIcon size={14} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/40">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start space-x-3 p-3.5 transition-colors ${
                          !n.is_read ? 'bg-indigo-500/5' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold overflow-hidden border border-indigo-500/30">
                          {n.actor?.avatar_url ? (
                            <img src={n.actor.avatar_url} alt={n.actor.username} className="h-full w-full object-cover" />
                          ) : (
                            n.actor?.username?.[0]?.toUpperCase() || 'S'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-200 leading-snug">
                            <span className="font-bold text-white">{n.actor?.first_name} {n.actor?.last_name}</span> {n.content}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block border-t border-slate-800 bg-slate-950/60 p-3 text-center text-xs font-bold text-indigo-400 hover:bg-slate-800/50"
                >
                  View Notifications Center
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 rounded-full border border-slate-700 p-0.5 transition-all hover:border-indigo-500"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  user.username?.[0]?.toUpperCase()
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
                <div className="border-b border-slate-800 p-3">
                  <p className="truncate font-bold text-white">{user.first_name} {user.last_name}</p>
                  <p className="truncate text-xs text-slate-500">@{user.username}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    <UserIcon size={16} />
                    <span>Your Profile</span>
                  </Link>
                  <Link
                    href="/connections"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    <UsersIcon size={16} />
                    <span>Connections Hub</span>
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    <MessageSquareIcon size={16} />
                    <span>Messages</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    <SettingsIcon size={16} />
                    <span>Settings</span>
                  </Link>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={logout}
                    className="flex w-full items-center space-x-3 rounded-xl px-3 py-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
                  >
                    <LogOutIcon size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
