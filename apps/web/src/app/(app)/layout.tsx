'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, signOut, type DemoSession } from '../../lib/auth-client'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<DemoSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace('/sign-in')
    } else {
      setSession(s)
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="text-[#E8733A]">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <span className="text-xl">⭕</span>
          <span className="text-xl font-bold text-gray-900">Round</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/home" className="hover:text-gray-900">Home</Link>
          <Link href="/circles" className="hover:text-gray-900">My circles</Link>
          <Link href="/pricing" className="hover:text-gray-900">Upgrade</Link>
          <button
            onClick={() => { signOut(); router.push('/sign-in') }}
            className="text-gray-400 hover:text-gray-700 text-xs"
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
