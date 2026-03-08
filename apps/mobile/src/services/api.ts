import {
  UserProfile,
  CircleDetail,
  CircleSummary,
  MealCard,
  NotificationItem,
  SubscriptionStatus,
} from '@round/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

class APIClient {
  private getToken: (() => Promise<string | null>) | null = null

  setTokenGetter(fn: () => Promise<string | null>) {
    this.getToken = fn
  }

  private async headers() {
    const token = await this.getToken?.()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(await this.headers()),
        ...(options?.headers || {}),
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${res.status}`)
    }

    if (res.status === 204) return null as T
    return res.json()
  }

  // User
  async getMe(): Promise<UserProfile> {
    return this.request('/users/me')
  }

  async updateMe(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request('/users/me', { method: 'PATCH', body: JSON.stringify(data) })
  }

  async getMyCircles(): Promise<CircleSummary[]> {
    return this.request('/users/me/circles')
  }

  // Circles
  async createCircle(data: Partial<CircleDetail>): Promise<CircleDetail> {
    return this.request('/circles', { method: 'POST', body: JSON.stringify(data) })
  }

  async getCircle(id: string): Promise<CircleDetail> {
    return this.request(`/circles/${id}`)
  }

  async joinCircle(inviteCode: string): Promise<void> {
    return this.request(`/circles/join/${inviteCode}`, { method: 'POST' })
  }

  async leaveCircle(circleId: string): Promise<void> {
    return this.request(`/circles/${circleId}/leave`, { method: 'DELETE' })
  }

  async getCircleSchedule(circleId: string): Promise<any> {
    return this.request(`/circles/${circleId}/schedule`)
  }

  async refreshInviteCode(circleId: string): Promise<{ inviteCode: string }> {
    return this.request(`/circles/${circleId}/invite/refresh`, { method: 'POST' })
  }

  async confirmMyTurn(circleId: string): Promise<void> {
    return this.request(`/circles/${circleId}/turns/confirm`, { method: 'POST' })
  }

  // Meals
  async getMealsForCircle(circleId: string, weekStart?: string): Promise<MealCard[]> {
    const q = weekStart ? `?week=${weekStart}` : ''
    return this.request(`/meals/circle/${circleId}${q}`)
  }

  async getMeal(id: string): Promise<MealCard> {
    return this.request(`/meals/${id}`)
  }

  async createMeal(data: any): Promise<MealCard> {
    return this.request('/meals', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateMeal(id: string, data: any): Promise<MealCard> {
    return this.request(`/meals/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async cancelMeal(id: string): Promise<void> {
    return this.request(`/meals/${id}`, { method: 'DELETE' })
  }

  async saveASeat(mealId: string, portions = 1): Promise<void> {
    return this.request(`/meals/${mealId}/seat`, {
      method: 'POST',
      body: JSON.stringify({ portions }),
    })
  }

  async unsaveSeat(mealId: string): Promise<void> {
    return this.request(`/meals/${mealId}/seat`, { method: 'DELETE' })
  }

  // Reviews
  async createReview(data: { mealId: string; rating: number; comment?: string; type: string }): Promise<void> {
    return this.request('/reviews', { method: 'POST', body: JSON.stringify(data) })
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request('/notifications')
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' })
  }

  // Subscriptions
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    return this.request('/subscriptions/status')
  }

  async createCheckoutSession(priceKey: string): Promise<{ url: string }> {
    return this.request('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({
        priceKey,
        successUrl: 'round://subscription/success',
        cancelUrl: 'round://subscription/cancel',
      }),
    })
  }

  // Matching (Round Member+)
  async getMatchingSuggestions(): Promise<any> {
    return this.request('/matching/suggestions')
  }

  async requestMatching(): Promise<void> {
    return this.request('/matching/request', { method: 'POST' })
  }
}

export const api = new APIClient()
