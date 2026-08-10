'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  HomeIcon,
  CompassIcon,
  UsersIcon,
  MessageSquareIcon,
  BellIcon,
  PlusCircleIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const navItems = [
    { name: 'Home', href: '/feed', icon: HomeIcon, match: '/feed' },
    { name: 'Discover', href: '/discover', icon: CompassIcon, match: '/discover' },
    { name: 'Connections', href: '/connections', icon: UsersIcon, match: '/connections' },
    { name: 'Messages', href: '/messages', icon: MessageSquareIcon, match: '/messages' },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, match: '/notifications' },
    { name: 'Create', href: '/create', icon: PlusCircleIcon, match: '/create' },
    { name: 'Profile', href: `/profile/${user.id}`, icon: UserIcon, match: '/profile' },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, match: '/settings' },
  ]

  const isActive = (href: string, match: string) => {
    if (pathname === href) return true
    return pathname.startsWith(match)
  }

  return (
    <>
      {/* Desktop Sidebar (Sticky 64-column left navigation) */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 p-4 backdrop-blur-xl md:flex">
        
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.match)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={20} className={active ? 'text-indigo-400' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Mini Card & Logout */}
        <div className="space-y-3 border-t border-slate-800/80 pt-4">
          <Link
            href={`/profile/${user.id}`}
            className="flex items-center space-x-3 rounded-2xl p-2.5 transition-colors hover:bg-slate-900 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold overflow-hidden border border-indigo-500/30">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                user.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                {user.first_name} {user.last_name}
              </p>
              <p className="truncate text-[11px] text-slate-500">@{user.username}</p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="flex w-full items-center space-x-3.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOutIcon size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 px-2 py-2.5 backdrop-blur-xl md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.match)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center text-[10px] font-semibold transition-all ${
                active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-200'
              }`}
              aria-label={item.name}
            >
              <div className={`p-1.5 rounded-xl ${active ? 'bg-indigo-500/15' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="mt-0.5">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
