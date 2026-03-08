import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

const API = process.env.API_URL || 'http://localhost:4000'

async function getData(token: string) {
  const [circlesRes, notifRes] = await Promise.all([
    fetch(`${API}/users/me/circles`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
  ])
  const circles = circlesRes.ok ? await circlesRes.json() : []
  const notifications = notifRes.ok ? await notifRes.json() : []
  return { circles, notifications }
}

export default async function HomePage() {
  const { getToken } = auth()
  const token = await getToken()
  if (!token) redirect('/sign-in')

  const { circles, notifications } = await getData(token)
  const unread = notifications.filter((n: any) => !n.read).length

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your week</h1>
      <p className="text-gray-500 mb-8">What's cooking in your circles.</p>

      {unread > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <span className="text-orange-600 font-semibold text-sm">{unread} unread notification{unread !== 1 ? 's' : ''}</span>
        </div>
      )}

      {circles.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
          <p className="text-2xl mb-3">⭕</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No circles yet</h2>
          <p className="text-gray-500 mb-6">Start a dinner circle with your neighbors or enter an invite code.</p>
          <a href="/circles/new" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
            Start a circle
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {circles.map((circle: any) => (
            <a
              key={circle.id}
              href={`/circles/${circle.id}`}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-orange-200 transition block"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{circle.name}</h3>
                <span className="text-sm text-gray-400">{circle.memberCount} neighbors</span>
              </div>
              {circle.myTurn && (
                <p className="text-sm text-orange-600 font-medium">
                  Your turn: {circle.myTurn}s
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">{circle.neighborhoodName || circle.city}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
