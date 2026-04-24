'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2Icon, ZapIcon, UsersIcon, ShieldIcon } from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed')
    }
  }, [user, loading, router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2Icon className="animate-spin text-indigo-500" size={32} />
    </div>
  )

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="animate-slide-up space-y-8">
        <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-sm font-semibold tracking-wide uppercase">
          New Social Experience
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          Connect with your world in <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">SocialConnect</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A premium, minimalist social space designed for creators, thinkers, and friends. No noise, just meaningful connections.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/register" className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/25">
            Get Started Free
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg transition-all">
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 max-w-5xl mx-auto">
          <div className="glass-card p-6 text-left space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ZapIcon size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Lightning Fast</h3>
            <p className="text-slate-400 text-sm">Experience real-time interactions with zero lag. Built on Next.js 15.</p>
          </div>
          
          <div className="glass-card p-6 text-left space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <UsersIcon size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Vibrant Community</h3>
            <p className="text-slate-400 text-sm">Connect with like-minded individuals and grow your network.</p>
          </div>

          <div className="glass-card p-6 text-left space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldIcon size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Private & Secure</h3>
            <p className="text-slate-400 text-sm">Your data is yours. We prioritize security and user privacy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
