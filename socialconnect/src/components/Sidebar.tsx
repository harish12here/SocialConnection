'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  HomeIcon,
  MessageSquareIcon,
  SearchIcon,
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
    { name: 'Messages', href: '/messages', icon: MessageSquareIcon, match: '/messages' },
    { name: 'Search', href: '/search', icon: SearchIcon, match: '/search' },
    { name: 'Post', href: '/create', icon: PlusCircleIcon, match: '/create' },
    { name: 'Profile', href: `/profile/${user.id}`, icon: UserIcon, match: '/profile' },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, match: '/settings' },
  ]

  const isActive = (href: string, match: string) => {
    if (pathname === href) return true
    return pathname.startsWith(match)
  }

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col hidden md:flex">
        <div className="mb-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
            SocialConnect
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.match)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  active
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-6">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOutIcon size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.match)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center text-xs transition-all ${
                active ? 'text-indigo-400' : 'text-slate-500 hover:text-white'
              }`}
              aria-label={item.name}
            >
              <Icon size={20} />
              <span className="mt-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
