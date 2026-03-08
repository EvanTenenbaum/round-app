import Link from 'next/link'
import { Flame, Users, Calendar, Heart, ChevronRight, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFF9F3]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold text-[#3D2314]">Round</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/how-it-works" className="text-sm text-[#7A5A48] hover:text-[#3D2314]">
            How it works
          </Link>
          <Link href="/pricing" className="text-sm text-[#7A5A48] hover:text-[#3D2314]">
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-[#E8733A] hover:text-[#C55A25]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-[#E8733A] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#C55A25] transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#E8733A]/10 text-[#E8733A] text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span>🍳</span>
          <span>Cook once. Eat well all week.</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-[#3D2314] leading-tight mb-6">
          Your neighborhood<br />
          <span className="text-[#E8733A]">meal co-op</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#7A5A48] max-w-2xl mx-auto mb-10 leading-relaxed">
          Form a small cooking circle with neighbors or friends. Each person cooks once per week and enjoys
          home-cooked meals the rest of the week — without the hassle.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-[#E8733A] text-white font-bold px-8 py-4 rounded-full text-base hover:bg-[#C55A25] transition-colors flex items-center justify-center gap-2"
          >
            Start for free <ChevronRight size={18} />
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto border-2 border-[#3D2314] text-[#3D2314] font-bold px-8 py-4 rounded-full text-base hover:bg-[#3D2314] hover:text-white transition-colors flex items-center justify-center"
          >
            See how it works
          </Link>
        </div>

        <p className="text-sm text-[#BFB3A8] mt-6">Free forever for 1 pod · No credit card required</p>
      </section>

      {/* Social proof */}
      <section className="bg-[#FDF6EC] py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
          {[
            { stat: '3×', label: 'More home-cooked meals per week' },
            { stat: '70%', label: 'Less time spent in the kitchen' },
            { stat: '$200+', label: 'Saved on food delivery per month' },
          ].map(({ stat, label }) => (
            <div key={stat} className="flex flex-col">
              <span className="text-4xl font-extrabold text-[#E8733A]">{stat}</span>
              <span className="text-sm text-[#7A5A48] mt-1 max-w-[140px] mx-auto leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D2314] text-center mb-16">
          Simple by design
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: <Users size={28} className="text-[#E8733A]" />,
              step: '01',
              title: 'Form your pod',
              desc: 'Invite 3–8 neighbors or friends. Or use our matching to find compatible cooks near you.',
            },
            {
              icon: <Calendar size={28} className="text-[#4A7C59]" />,
              step: '02',
              title: 'Pick your cook day',
              desc: 'Each person cooks once per week. The app handles scheduling and reminds you the day before.',
            },
            {
              icon: <Heart size={28} className="text-[#E8733A]" />,
              step: '03',
              title: 'Share and enjoy',
              desc: 'Post what you're making, claim meals from your pod, and arrange easy doorstep pickups.',
            },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDE8E3]">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#FDF6EC] p-3 rounded-xl">{icon}</div>
                <span className="text-3xl font-extrabold text-[#EDE8E3]">{step}</span>
              </div>
              <h3 className="text-lg font-bold text-[#3D2314] mb-2">{title}</h3>
              <p className="text-sm text-[#7A5A48] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#3D2314] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">
            What co-op cooks say
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "I only cook on Wednesdays now but eat home-cooked meals every weeknight. It's completely changed my relationship with food.",
                name: 'Maya K.',
                role: 'Working parent, SF',
              },
              {
                quote: "We started as strangers and now we're friends. The app made it easy to coordinate — I just show up for pickup.",
                name: 'Tomás R.',
                role: 'Software engineer, Austin',
              },
              {
                quote: "Way better than meal kits. Real food made by real people who live two blocks away.",
                name: 'Dana P.',
                role: 'Teacher, Portland',
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="bg-white/10 rounded-2xl p-6">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className="text-[#E8733A] fill-[#E8733A]" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-white/50 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-extrabold text-[#3D2314] mb-4">Honest pricing</h2>
        <p className="text-[#7A5A48] mb-12">Start free. Upgrade if you want more pods or the matching feature.</p>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              note: 'forever',
              features: ['1 pod', 'Unlimited meals', 'Basic scheduling', 'Push notifications'],
              cta: 'Get started',
              href: '/signup',
              featured: false,
            },
            {
              name: 'Premium',
              price: '$4.99',
              note: '/month or $39/year',
              features: ['Unlimited pods', 'Smart matching', 'Full meal history', 'AI meal suggestions'],
              cta: 'Start free trial',
              href: '/signup?plan=premium',
              featured: true,
            },
            {
              name: 'Lifetime',
              price: '$14.99',
              note: 'one time',
              features: ['Everything in Premium', 'No recurring charges', 'Priority support', 'Early access to new features'],
              cta: 'Buy once, keep forever',
              href: '/signup?plan=lifetime',
              featured: false,
            },
          ].map(({ name, price, note, features, cta, href, featured }) => (
            <div
              key={name}
              className={`rounded-2xl p-6 border-2 ${featured ? 'border-[#E8733A] bg-[#E8733A]/5' : 'border-[#EDE8E3] bg-white'}`}
            >
              {featured && (
                <div className="text-xs font-bold text-[#E8733A] uppercase tracking-wide mb-3">Most popular</div>
              )}
              <p className="font-bold text-[#3D2314] text-lg">{name}</p>
              <p className="text-3xl font-extrabold text-[#3D2314] mt-2">{price}</p>
              <p className="text-xs text-[#7A5A48] mb-4">{note}</p>
              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#7A5A48]">
                    <span className="text-[#4A7C59]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`block text-center text-sm font-bold py-3 rounded-full transition-colors ${
                  featured
                    ? 'bg-[#E8733A] text-white hover:bg-[#C55A25]'
                    : 'border-2 border-[#3D2314] text-[#3D2314] hover:bg-[#3D2314] hover:text-white'
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="bg-[#E8733A] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your neighbors are cooking tonight.
          </h2>
          <p className="text-white/80 mb-8 text-lg">Join them.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#E8733A] font-bold px-10 py-4 rounded-full text-base hover:bg-[#FDF6EC] transition-colors"
          >
            Create your pod for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D2314] py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-white/70">Round</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/70">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70">Terms</Link>
            <Link href="mailto:hello@round.app" className="hover:text-white/70">Contact</Link>
          </div>
          <p>© {new Date().getFullYear()} Round. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
