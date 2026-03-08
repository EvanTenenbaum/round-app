import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    template: '%s | Round',
    default: 'Round — Community Meal Co-Op',
  },
  description:
    'Form a small cooking circle with neighbors. Cook once per week. Eat home-cooked meals all week.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://round.app'),
  openGraph: {
    title: 'Round — Community Meal Co-Op',
    description: 'Cook once per week. Eat home-cooked meals all week.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Round — Community Meal Co-Op',
    description: 'Cook once per week. Eat home-cooked meals all week.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#FFF9F3] text-[#3D2314] antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
