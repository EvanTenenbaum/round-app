import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = process.env.DEMO_EMAIL || 'evan@round.app'
        const password = process.env.DEMO_PASSWORD || 'Round2026!'
        if (credentials?.email === email && credentials?.password === password) {
          return { id: 'demo_user', name: 'Evan', email, image: null }
        }
        return null
      },
    }),
  ],
  pages: { signIn: '/sign-in' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.userId
      return session
    },
  },
}
