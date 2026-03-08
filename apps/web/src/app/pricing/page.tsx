import { TIER_PRICES, TIER_LABELS } from '@round/shared'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, fair pricing</h1>
        <p className="text-xl text-gray-500">Cook once. Eat all week.</p>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Round</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">Free</p>
          <p className="text-sm text-gray-400 mb-6">Forever</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-8">
            {['1 circle', 'Up to 4 neighbors', 'Post unlimited meals', '30-day history', 'Push notifications'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <a href="/sign-up" className="block text-center border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:border-gray-400 transition">
            Get started
          </a>
        </div>

        {/* Round Member */}
        <div className="bg-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Popular</div>
          <p className="text-sm font-semibold text-orange-200 uppercase tracking-wider mb-2">Round Member</p>
          <div className="flex items-baseline gap-1 mb-1">
            <p className="text-3xl font-bold">${TIER_PRICES.MONTHLY}</p>
            <p className="text-orange-200">/mo</p>
          </div>
          <p className="text-sm text-orange-200 mb-6">or ${TIER_PRICES.ANNUAL}/yr — save 38%</p>
          <ul className="space-y-3 text-sm mb-8">
            {[
              'Everything in Round',
              'Unlimited circles',
              'Up to 8 neighbors per circle',
              'Neighborhood matching',
              'Full meal history & stats',
              'AI meal suggestions',
              'Priority support',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span>✓</span> {f}
              </li>
            ))}
          </ul>
          <a href="/sign-up?plan=member" className="block text-center bg-white text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition">
            Upgrade to Round Member
          </a>
        </div>

        {/* Founding Member */}
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 relative">
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Launch only</div>
          <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-2">Founding Member</p>
          <div className="flex items-baseline gap-1 mb-1">
            <p className="text-3xl font-bold text-gray-900">${TIER_PRICES.FOUNDING}</p>
          </div>
          <p className="text-sm text-gray-400 mb-6">One-time · Lifetime access</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-8">
            {[
              'Everything in Round Member',
              'Lifetime access — never expires',
              'Founding Member badge',
              'Support Round from day one',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-orange-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mb-4">
            After launch, lifetime access moves to $89. Lock in $49 now.
          </p>
          <a href="/sign-up?plan=founding" className="block text-center bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
            Become a Founding Member
          </a>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-10">
        No ads. No upsells in your circle. Round is ad-free.
      </p>
    </div>
  )
}
