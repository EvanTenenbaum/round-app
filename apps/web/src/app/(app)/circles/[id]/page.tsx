import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { DAY_LABELS } from '@round/shared'

const API = process.env.API_URL || 'http://localhost:4000'

export default async function CircleDetailPage({ params }: { params: { id: string } }) {
  const { getToken } = auth()
  const token = await getToken()
  if (!token) redirect('/sign-in')

  const [circleRes, mealsRes] = await Promise.all([
    fetch(`${API}/circles/${params.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${API}/meals/circle/${params.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
  ])

  if (!circleRes.ok) redirect('/home')

  const circle = await circleRes.json()
  const meals = mealsRes.ok ? await mealsRes.json() : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{circle.name}</h1>
        <p className="text-gray-500 mt-1">{circle.memberCount} neighbors · {circle.neighborhoodName || circle.city}</p>
        {circle.myTurn && (
          <p className="text-orange-600 font-medium mt-1">Your turn: {DAY_LABELS[circle.myTurn as keyof typeof DAY_LABELS]}s</p>
        )}
      </div>

      {circle.inviteCode && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-600">Invite code: <strong className="font-mono text-gray-900">{circle.inviteCode}</strong></span>
          <a href={`https://round.app/invite/${circle.inviteCode}`} className="text-sm text-orange-600 font-medium">Copy link</a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* This week's meals */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">This week</h2>
          {meals.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <p className="text-gray-400 text-sm">No meals posted yet this week.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {meals.map((meal: any) => (
                <div key={meal.id} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-900">{meal.title}</p>
                    <span className="text-xs text-gray-400">{new Date(meal.cookDate).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                  <p className="text-sm text-gray-500">by {meal.cook.name} · {meal.servingsSaved}/{meal.servingsAvailable} seats</p>
                  {meal.allergenNotes && (
                    <p className="text-xs text-amber-600 mt-1">{meal.allergenNotes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Neighbors</h2>
          <div className="grid gap-2">
            {circle.members?.map((m: any) => (
              <div key={m.userId} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{m.name}{m.role === 'OWNER' ? ' · Organizer' : ''}</p>
                  <p className="text-xs text-gray-400">{m.turn ? `Cooks ${DAY_LABELS[m.turn as keyof typeof DAY_LABELS]}s` : 'No turn yet'}</p>
                </div>
                <span className="text-xs text-gray-400">{Math.round(m.reliabilityRate * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
