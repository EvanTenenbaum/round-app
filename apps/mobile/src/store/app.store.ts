import { create } from 'zustand'
import { UserProfile, CircleSummary, NotificationItem } from '@round/shared'

interface AppState {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void

  // Pods
  pods: CircleSummary[]
  setPods: (pods: CircleSummary[]) => void
  activePodId: string | null
  setActivePodId: (id: string | null) => void

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

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  setUser: user => set({ user }),
  updateUser: updates =>
    set(state => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  pods: [],
  setPods: pods => set({ pods }),
  activePodId: null,
  setActivePodId: id => set({ activePodId: id }),

  notifications: [],
  setNotifications: notifications => {
    const unread = notifications.filter(n => !n.read).length
    set({ notifications, unreadCount: unread })
  },
  unreadCount: 0,
  incrementUnread: () => set(state => ({ unreadCount: state.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),

  isOnboarding: false,
  setIsOnboarding: v => set({ isOnboarding: v }),
}))
