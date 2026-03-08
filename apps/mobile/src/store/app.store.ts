import { create } from 'zustand'
import { UserProfile, CircleSummary, NotificationItem } from '@round/shared'

interface AppState {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void

  // Circles (canonical name; circles/pods aliases both work)
  circles: CircleSummary[]
  setCircles: (circles: CircleSummary[]) => void
  currentCircle: CircleSummary | null
  setCurrentCircle: (circle: CircleSummary | null) => void

  // Notifications
  notifications: NotificationItem[]
  setNotifications: (notifs: NotificationItem[]) => void
  unreadCount: number
  incrementUnread: () => void
  clearUnread: () => void

  // UI state
  isOnboarding: boolean
  setIsOnboarding: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: user => set({ user }),
  updateUser: updates =>
    set(state => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  circles: [],
  setCircles: circles => set({ circles, currentCircle: circles[0] ?? null }),
  currentCircle: null,
  setCurrentCircle: circle => set({ currentCircle: circle }),

  notifications: [],
  setNotifications: notifications => {
    const unreadCount = notifications.filter(n => !n.read).length
    set({ notifications, unreadCount })
  },
  unreadCount: 0,
  incrementUnread: () => set(state => ({ unreadCount: state.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),

  isOnboarding: false,
  setIsOnboarding: v => set({ isOnboarding: v }),
}))
