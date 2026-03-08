// Round — Shared Types
// Used across api, web, and mobile

export type SubscriptionTier = 'FREE' | 'MEMBER' | 'FOUNDING'

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  FREE: 'Round',
  MEMBER: 'Round Member',
  FOUNDING: 'Founding Member',
}

export const TIER_PRICES = {
  MONTHLY: 7.99,
  ANNUAL: 59,
  FOUNDING: 49,     // launch only
  POST_LAUNCH_FOUNDING: 89,     // post-launch
} as const

export type DietaryRestriction =
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'GLUTEN_FREE'
  | 'DAIRY_FREE'
  | 'NUT_FREE'
  | 'HALAL'
  | 'KOSHER'
  | 'OTHER'

export type PortionSize = 'SMALL' | 'STANDARD' | 'LARGE'

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
}

export type CircleStatus = 'FORMING' | 'ACTIVE' | 'PAUSED' | 'DISBANDED'

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type MemberStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'LEFT'

export type MealStatus = 'DRAFT' | 'POSTED' | 'FULL' | 'DONE' | 'CANCELLED'

export type SeatStatus = 'CONFIRMED' | 'PICKED_UP' | 'NO_SHOW'

export type NotificationType =
  | 'TURN_REMINDER'
  | 'TURN_CONFIRM_REQUEST'
  | 'MEAL_POSTED'
  | 'SEAT_SAVED'
  | 'PICKUP_REMINDER'
  | 'CIRCLE_INVITE'
  | 'CIRCLE_MEMBER_JOINED'
  | 'REVIEW_RECEIVED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SYSTEM'

// ─────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────

export interface UserProfile {
  id: string
  clerkId: string
  email: string
  name: string
  avatar?: string | null
  bio?: string | null
  lat?: number | null
  lng?: number | null
  neighborhoodName?: string | null
  city?: string | null
  state?: string | null
  dietaryRestrictions: DietaryRestriction[]
  allergenNotes?: string | null
  portionSize: PortionSize
  cookingStyles: string[]
  cookingSkillLevel: number
  containerPolicy?: string | null
  reliabilityScore: number
  subscriptionTier: SubscriptionTier
  onboardingComplete: boolean
}

export interface CircleMember {
  id: string
  userId: string
  name: string
  avatar?: string | null
  role: MemberRole
  turn?: DayOfWeek | null
  reliabilityRate: number
  noShowCount: number
  totalMealsCooked: number
  totalMealsReceived: number
  averageRating?: number | null
  reviewCount: number
  dietaryRestrictions: DietaryRestriction[]
  cookingStyles: string[]
}

export interface CircleSummary {
  id: string
  name: string
  status: CircleStatus
  memberCount: number
  myRole: MemberRole | null
  myTurn?: DayOfWeek | null
  neighborhoodName?: string | null
  city?: string | null
}

export interface CircleDetail extends CircleSummary {
  description?: string | null
  inviteCode: string | null // null for non-members
  maxSize: number
  isPublic: boolean
  requiresApproval: boolean
  members: CircleMember[]
}

export interface SeatSummary {
  id: string
  dinerId: string
  portions: number
  status: SeatStatus
  diner: {
    id: string
    name: string
    avatar?: string | null
  }
}

export interface MealCard {
  id: string
  circleId: string
  cookId: string
  title: string
  description?: string | null
  photo?: string | null
  cuisineType?: string | null
  dietaryTags: DietaryRestriction[]
  allergenNotes?: string | null
  servingsAvailable: number
  servingsSaved: number
  containerPolicy: string
  pickupTime: string
  pickupLocation: string
  pickupNotes?: string | null
  status: MealStatus
  cookDate: string
  cook: {
    id: string
    name: string
    avatar?: string | null
  }
  seats?: SeatSummary[]
  mySeat?: SeatSummary | null
}

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, string> | null
  read: boolean
  createdAt: string
}

export interface SubscriptionStatus {
  tier: SubscriptionTier
  label: string
  isFounding: boolean
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd?: boolean
}
