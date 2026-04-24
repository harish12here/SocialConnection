'use client'

import React, { useState, useEffect, useRef } from 'react'
import { User } from '@/types'
import { PhoneIcon, VideoIcon, XIcon, MicIcon, MicOffIcon, VideoOffIcon, PhoneOffIcon } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface CallOverlayProps {
  callId: string | null
  partner: User | null
  type: 'audio' | 'video'
  isIncoming: boolean
  onClose: () => void
}

export default function CallOverlay({ callId, partner, type, isIncoming, onClose }: CallOverlayProps) {
  const [status, setStatus] = useState<'calling' | 'ringing' | 'connected' | 'disconnected'>(isIncoming ? 'ringing' : 'calling')
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [timer, setTimer] = useState(0)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let interval: any
    if (status === 'connected') {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [status])

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video',
          audio: true
        })
        streamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        // In a real app, we would set up RTCPeerConnection here.
        if (!isIncoming) {
          setStatus('calling')
          setTimeout(() => setStatus('connected'), 3000)
        }
      } catch (err) {
        console.error('Media access error:', err)
        alert('Could not access camera/microphone')
        onClose()
      }
    }

    startCall()

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [type, isIncoming, onClose])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = async () => {
    setStatus('connected')
    if (callId) {
      await apiClient(`/api/calls/${callId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'accepted' })
      })
    }
  }

  const handleEnd = async () => {
    setStatus('disconnected')
    if (callId) {
      await apiClient(`/api/calls/${callId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ended' })
      })
    }
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  useEffect(() => {
    if (status !== 'disconnected') return
    const timeout = setTimeout(() => onClose(), 2500)
    return () => clearTimeout(timeout)
  }, [status, onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background/Video Area */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black">
        {type === 'video' && status === 'connected' && (
          <div className="relative w-full h-full">
            {/* Remote Video (Simulated/Real placeholder) */}
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover opacity-50 grayscale"
              poster={partner?.avatar_url || ''}
            />
            {/* Local Video Overlay */}
            <div className="absolute bottom-24 right-6 w-32 h-48 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl bg-black">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${videoOff ? 'hidden' : ''}`}
              />
              {videoOff && (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <VideoOffIcon className="text-slate-500" size={24} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${status === 'connected' && type === 'video' ? 'top-[-20%] scale-75 opacity-50' : ''}`}>
        <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 p-1 mb-6 animate-pulse">
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
            {partner?.avatar_url ? (
              <img src={partner.avatar_url} alt={partner.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-indigo-400">
                {partner?.username?.[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{partner?.first_name} {partner?.last_name}</h2>
        <p className="text-slate-400 font-medium">
          {status === 'ringing' && 'Incoming Call...'}
          {status === 'calling' && 'Calling...'}
          {status === 'connected' && formatTime(timer)}
          {status === 'disconnected' && 'Call disconnected'}
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 z-20 flex items-center space-x-8">
        {status === 'ringing' && isIncoming ? (
          <>
            <button 
              onClick={handleEnd}
              className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-90"
            >
              <PhoneOffIcon size={28} />
            </button>
            <button 
              onClick={handleAccept}
              className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/40 active:scale-90 animate-bounce"
            >
              {type === 'video' ? <VideoIcon size={32} /> : <PhoneIcon size={32} />}
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setMuted(!muted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${muted ? 'bg-slate-700 text-rose-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            >
              {muted ? <MicOffIcon size={24} /> : <MicIcon size={24} />}
            </button>
            
            <button 
              onClick={handleEnd}
              className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/30 active:scale-90"
            >
              <PhoneOffIcon size={28} />
            </button>

            {type === 'video' && (
              <button 
                onClick={() => setVideoOff(!videoOff)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${videoOff ? 'bg-slate-700 text-rose-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {videoOff ? <VideoOffIcon size={24} /> : <VideoIcon size={24} />}
              </button>
            )}
          </>
        )}
      </div>

      {/* Visual Ringing Waves */}
      {status === 'ringing' && (
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
          <div className="absolute w-[300px] h-[300px] border border-indigo-500 rounded-full animate-ping"></div>
          <div className="absolute w-[500px] h-[500px] border border-indigo-500 rounded-full animate-ping animation-delay-500"></div>
        </div>
      )}
    </div>
  )
}
