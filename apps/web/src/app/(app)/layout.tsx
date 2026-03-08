import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="text-xl font-bold text-gray-900">Round</Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/home" className="hover:text-gray-900">Home</Link>
          <Link href="/circles" className="hover:text-gray-900">My circles</Link>
          <Link href="/pricing" className="hover:text-gray-900">Upgrade</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
