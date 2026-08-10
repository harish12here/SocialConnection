'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { uploadFile } from '@/lib/storage'
import { SparklesIcon, CameraIcon, CheckIcon, ArrowRightIcon, Loader2Icon } from 'lucide-react'

const INTEREST_OPTIONS = [
  'Technology', 'Design & UI', 'Photography', 'Gaming',
  'Software Engineering', 'Art & Illustration', 'Music & Audio',
  'Startup & Business', 'Fitness & Health', 'AI & Machine Learning'
]

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file, 'avatars')
      setAvatarUrl(url)
    } catch {
      // ignore
    } finally {
      setUploading(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  const handleFinish = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          location,
          avatar_url: avatarUrl || user?.avatar_url,
          interests: selectedInterests
        })
      })

      if (res.ok) {
        const data = await res.json()
        updateProfile(data.data || data)
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
      router.push('/feed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full glass-card p-8 border border-slate-800/80 bg-slate-950/90 shadow-2xl space-y-8 animate-slide-up">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <SparklesIcon size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Welcome to SocialConnect</h1>
              <p className="text-xs text-slate-500">Step {step} of 2</p>
            </div>
          </div>

          <div className="flex space-x-1">
            <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
            <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
          </div>
        </div>

        {/* Step 1: Bio & Photo */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">Set up your profile</h2>
              <p className="text-slate-400 text-sm">Add a photo and quick bio so your peers can recognize you.</p>
            </div>

            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-indigo-500 transition-colors">
                  {uploading ? (
                    <Loader2Icon className="animate-spin text-indigo-400" size={24} />
                  ) : avatarUrl || user?.avatar_url ? (
                    <img src={avatarUrl || user?.avatar_url!} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <CameraIcon size={32} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Bio</label>
                <textarea
                  placeholder="Tell the community a bit about yourself..."
                  className="input-field h-24 resize-none text-sm"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={160}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="input-field text-sm"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <span>Continue to Interests</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Select Interests */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">What are you interested in?</h2>
              <p className="text-slate-400 text-sm">Select topics to personalize your recommendations.</p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center py-2">
              {INTEREST_OPTIONS.map(interest => {
                const selected = selectedInterests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                      selected
                        ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {selected && <CheckIcon size={14} />}
                    <span>{interest}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1 py-3 text-sm font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <Loader2Icon className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>Enter SocialConnect</span>
                    <SparklesIcon size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
