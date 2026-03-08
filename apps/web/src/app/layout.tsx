import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Round',
    default: 'Round — Neighborhood Meal Co-Op',
  },
  description:
    'Form a small cooking circle with neighbors. Cook once a week. Eat home-cooked meals all week.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://round.app'),
  openGraph: {
    title: 'Round — Neighborhood Meal Co-Op',
    description: 'Cook once a week. Eat home-cooked meals all week.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
