'use client'
import Link from 'next/link'

// Sign-up is handled by invite only in the beta.
// This page directs new users to request access.
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F3] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="text-3xl">⭕</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-3">Round is invite-only for now</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          We're growing one neighborhood at a time. Join the waitlist and we'll let you know when
          we open your area.
        </p>
        <a
          href="mailto:hello@round.app?subject=Round waitlist"
          className="block w-full bg-[#E8733A] text-white font-semibold py-3 rounded-xl hover:bg-[#C55A25] transition-colors mb-4"
        >
          Request early access
        </a>
        <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-700">
          Already have an account? Sign in →
        </Link>
      </div>
    </div>
  )
}
