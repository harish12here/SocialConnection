'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { uploadFile } from '@/lib/storage'
import { Loader2Icon, CameraIcon, SaveIcon, KeyIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, updateProfile, logout, theme, toggleTheme } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    website: '',
    location: '',
    avatar_url: ''
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [privacySettings, setPrivacySettings] = useState({
    privateAccount: false,
    whoCanMessage: 'everyone' as 'everyone' | 'following'
  })
  const [notificationSettings, setNotificationSettings] = useState({
    likes: true,
    messages: true
  })
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [settingsMessage, setSettingsMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLoading(true)
      try {
        const url = await uploadFile(file, 'avatars')
        setFormData(prev => ({ ...prev, avatar_url: url }))
      } catch (err) {
        setError('Failed to upload avatar')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setError('')
    setSettingsMessage('')

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const updated = await res.json()
        updateProfile(updated.data || updated)
        setSettingsMessage('Profile updated successfully')
      } else {
        const data = await res.json()
        setError(data.error || data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setSaveLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('Please fill all password fields')
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      })

      const data = await res.json()
      if (res.ok) {
        setPasswordMessage('Password updated successfully')
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      } else {
        setPasswordError(data.error || data.message || 'Failed to change password')
      }
    } catch (err) {
      setPasswordError('Something went wrong while changing your password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
      <div className="flex flex-col gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-500">Manage your profile, privacy, notifications, and more.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="text-lg font-semibold text-white">{user?.first_name} {user?.last_name}</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800/70 bg-slate-900/80 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>

      <div className="glass-card p-8 space-y-10">
        {(error || settingsMessage) && (
          <div className={`rounded-3xl border px-4 py-3 text-sm ${error ? 'border-rose-500 bg-rose-500/10 text-rose-300' : 'border-emerald-500 bg-emerald-500/10 text-emerald-200'}`}>
            {error || settingsMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
              <input
                type="text"
                className="input-field"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Website</label>
              <input
                type="url"
                className="input-field"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
            <textarea
              className="input-field h-24 resize-none"
              placeholder="Tell people about yourself"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <div className="text-right text-xs text-slate-500 mt-1">{formData.bio.length}/160</div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="relative group">
              <div className="h-28 w-28 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-indigo-400">
                    <Loader2Icon className="animate-spin" />
                  </div>
                ) : formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    <CameraIcon size={32} />
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                <span className="text-sm text-white">Upload</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={saveLoading}
              className="w-full rounded-3xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60 sm:w-auto"
            >
              {saveLoading ? <Loader2Icon className="animate-spin mr-2" size={18} /> : <SaveIcon size={18} className="mr-2" />}
              Save Profile
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Privacy</h2>
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Private account</p>
                    <p className="text-sm text-slate-500">Only approved followers can see your content.</p>
                  </div>
                  <button
                    type="button"
                    className={`rounded-full px-4 py-3 text-sm ${privacySettings.privateAccount ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                    onClick={() => setPrivacySettings(prev => ({ ...prev, privateAccount: !prev.privateAccount }))}
                  >
                    {privacySettings.privateAccount ? 'On' : 'Off'}
                  </button>
                </div>

                <div>
                  <p className="font-semibold text-white">Who can message you</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPrivacySettings(prev => ({ ...prev, whoCanMessage: 'everyone' }))}
                      className={`rounded-3xl border px-4 py-3 text-left text-sm ${privacySettings.whoCanMessage === 'everyone' ? 'border-indigo-500 bg-indigo-600/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500'}`}
                    >Everyone</button>
                    <button
                      type="button"
                      onClick={() => setPrivacySettings(prev => ({ ...prev, whoCanMessage: 'following' }))}
                      className={`rounded-3xl border px-4 py-3 text-left text-sm ${privacySettings.whoCanMessage === 'following' ? 'border-indigo-500 bg-indigo-600/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500'}`}
                    >Following only</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-5 space-y-4">
                <label className="flex items-center justify-between rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-4">
                  <div>
                    <p className="font-semibold text-white">Like notifications</p>
                    <p className="text-sm text-slate-500">Be notified when someone likes your posts.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.likes}
                    onChange={() => setNotificationSettings(prev => ({ ...prev, likes: !prev.likes }))}
                    className="h-5 w-5 rounded-md accent-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-4">
                  <div>
                    <p className="font-semibold text-white">Message notifications</p>
                    <p className="text-sm text-slate-500">Receive alerts when new messages arrive.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.messages}
                    onChange={() => setNotificationSettings(prev => ({ ...prev, messages: !prev.messages }))}
                    className="h-5 w-5 rounded-md accent-indigo-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">Theme</p>
                <p className="text-sm text-slate-500">Switch between dark and light mode.</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800"
              >
                {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-3xl border border-rose-500 px-6 py-4 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 transition sm:w-auto"
            >
              Log out
            </button>
            <p className="text-sm text-slate-500">Changes are saved locally and ready for backend persistence.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-8 mt-10">
        <div className="mb-4 text-sm text-slate-400">
          Tip: Some settings are preview-only until your backend routes support them fully.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4">
            <p className="font-semibold text-white">Profile</p>
            <p className="text-slate-500 text-sm">Edit your public name, bio, and photo.</p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4">
            <p className="font-semibold text-white">Privacy</p>
            <p className="text-slate-500 text-sm">Control who can view and message you.</p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4">
            <p className="font-semibold text-white">Notifications</p>
            <p className="text-slate-500 text-sm">Choose which alerts you receive.</p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4">
            <p className="font-semibold text-white">Security</p>
            <p className="text-slate-500 text-sm">Update your password and keep your account safe.</p>
          </div>
        </div>
      </div>

      <div className="glass-card border border-slate-800/70 bg-slate-950/80 p-8 mt-10">
        <div className="mb-5 flex items-center gap-3 text-slate-400">
          <KeyIcon size={20} />
          <p className="text-sm">Finish strong with a secure profile and notifications tailored to your workflow.</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
            />
          </div>

          {passwordError && <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">{passwordError}</div>}
          {passwordMessage && <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">{passwordMessage}</div>}

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full rounded-3xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {passwordLoading ? (
              <Loader2Icon className="animate-spin mr-2" size={18} />
            ) : (
              <KeyIcon size={18} className="mr-2" />
            )}
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
