import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

const API = process.env.API_URL || 'http://localhost:4000'

export default async function CirclesPage() {
  const { getToken } = auth()
  const token = await getToken()
  if (!token) redirect('/sign-in')

  const res = await fetch(`${API}/users/me/circles`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const circles = res.ok ? await res.json() : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My circles</h1>
        <a href="/circles/new" className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
          + New circle
        </a>
      </div>

      {circles.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
          <p className="text-gray-500">No circles yet. Start one or join with an invite code.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {circles.map((circle: any) => (
            <a
              key={circle.id}
              href={`/circles/${circle.id}`}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-orange-200 transition block"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{circle.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{circle.memberCount} neighbors · {circle.neighborhoodName || circle.city}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  circle.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {circle.status.charAt(0) + circle.status.slice(1).toLowerCase()}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
