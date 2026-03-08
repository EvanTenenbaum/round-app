'use client'
import { useEffect, useState } from 'react'
import { getSession, type DemoSession } from '../../../lib/auth-client'

export default function HomePage() {
  const [session, setSession] = useState<DemoSession | null>(null)
  useEffect(() => { setSession(getSession()) }, [])
  const firstName = session?.user?.name?.split(' ')[0] || 'neighbor'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Good evening, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Your circle is waiting for you.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mb-6">
        <div className="text-5xl mb-4">⭕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Start your dinner circle</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
          Invite 3–8 neighbors or friends. Each person cooks once a week and everyone eats home-cooked meals the rest of the time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-[#E8733A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#C55A25] text-sm">Create a circle</button>
          <button className="border-2 border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 text-sm">Join with invite code</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Meals this week', value: '—', sub: 'No circle yet' },
          { label: 'Your cook day', value: '—', sub: 'TBD' },
          { label: 'Circle members', value: '0', sub: 'Invite to start' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
