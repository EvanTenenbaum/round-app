'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function InvitePage({ params }: { params: { code: string } }) {
  const { getToken, isSignedIn } = useAuth()
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect=/invite/${params.code}`)
      return
    }
    setJoining(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/circles/join/${params.code}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Could not join')
        return
      }
      setJoined(true)
      setTimeout(() => router.push('/home'), 1500)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setJoining(false)
    }
  }

  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">You're in!</h1>
          <p className="text-gray-500 mt-2">Taking you to your circle…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC] px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⭕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You've been invited</h1>
        <p className="text-gray-500 mb-6">Someone's invited you to their dinner circle on Round.</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Invite code</p>
          <p className="text-3xl font-bold font-mono text-gray-900 tracking-widest">{params.code}</p>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition disabled:opacity-60 mb-3"
        >
          {joining ? 'Joining…' : 'Join circle'}
        </button>
        <a href="/" className="text-gray-400 text-sm hover:text-gray-600">Not now</a>
      </div>
    </div>
  )
}
