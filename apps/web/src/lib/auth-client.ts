// Simple client-side auth for static demo
// Credentials: evan@round.app / Round2026!

const DEMO_EMAIL = 'evan@round.app'
const DEMO_PASSWORD = 'Round2026!'
const SESSION_KEY = 'round_session'

export interface DemoSession {
  user: { name: string; email: string }
  expires: string
}

export function signIn(email: string, password: string): DemoSession | null {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const session: DemoSession = {
      user: { name: 'Evan Tenenbaum', email },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
    return session
  }
  return null
}

export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function getSession(): DemoSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: DemoSession = JSON.parse(raw)
    if (new Date(session.expires) < new Date()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}
