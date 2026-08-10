import React from 'react'

export function PostCardSkeleton() {
  return (
    <div className="glass-card p-5 mb-6 animate-pulse border border-slate-800/60">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-slate-800 skeleton-shimmer" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-slate-800 rounded skeleton-shimmer" />
          <div className="h-3 w-20 bg-slate-800/60 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-slate-800 rounded skeleton-shimmer" />
        <div className="h-4 w-3/4 bg-slate-800 rounded skeleton-shimmer" />
      </div>
      <div className="h-64 w-full bg-slate-800 rounded-2xl mb-4 skeleton-shimmer" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
        <div className="h-8 w-16 bg-slate-800 rounded-xl skeleton-shimmer" />
        <div className="h-8 w-16 bg-slate-800 rounded-xl skeleton-shimmer" />
        <div className="h-8 w-16 bg-slate-800 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  )
}

export function UserCardSkeleton() {
  return (
    <div className="glass-card p-4 flex items-center space-x-4 animate-pulse border border-slate-800/60">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 bg-slate-800 rounded skeleton-shimmer" />
        <div className="h-3 w-20 bg-slate-800/60 rounded skeleton-shimmer" />
      </div>
      <div className="h-9 w-24 bg-slate-800 rounded-xl skeleton-shimmer" />
    </div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="glass-card overflow-hidden mb-8 border-none animate-pulse">
      <div className="h-48 bg-slate-800 skeleton-shimmer" />
      <div className="px-6 pb-6 relative space-y-6">
        <div className="flex justify-between items-end -mt-16 mb-4">
          <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 skeleton-shimmer" />
          <div className="h-10 w-28 bg-slate-800 rounded-xl skeleton-shimmer" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-48 bg-slate-800 rounded skeleton-shimmer" />
          <div className="h-4 w-28 bg-slate-800/60 rounded skeleton-shimmer" />
          <div className="h-4 w-full max-w-md bg-slate-800/40 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}
