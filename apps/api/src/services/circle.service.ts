import { PrismaClient } from '@prisma/client'

interface CreateCircleInput {
  name: string
  description?: string
  maxSize?: number
  neighborhoodName?: string
  city?: string
  state?: string
  lat?: number
  lng?: number
  isPublic?: boolean
  requiresApproval?: boolean
}

export class CircleService {
  constructor(private db: PrismaClient) {}

  async createCircle(ownerId: string, input: CreateCircleInput) {
    const inviteCode = this.generateInviteCode()

    return this.db.$transaction(async tx => {
      const circle = await tx.circle.create({
        data: {
          ...input,
          inviteCode,
          createdById: ownerId,
          status: 'FORMING',
        },
      })

      await tx.circleMembership.create({
        data: {
          circleId: circle.id,
          userId: ownerId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      })

      return circle
    })
  }

  async getCircleWithMembers(circleId: string, requestingUserId: string) {
    const circle = await this.db.circle.findUnique({
      where: { id: circleId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                dietaryRestrictions: true,
                cookingStyles: true,
                cookingSkillLevel: true,
                reliabilityScore: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })

    if (!circle) return null

    const myMembership = circle.memberships.find(m => m.userId === requestingUserId)
    if (!myMembership && !circle.isPublic) return null

    const memberIds = circle.memberships.map(m => m.userId)
    const reviewAggs = await this.db.review.groupBy({
      by: ['revieweeId'],
      where: { revieweeId: { in: memberIds } },
      _avg: { rating: true },
      _count: { rating: true },
    })
    const reviewMap = Object.fromEntries(
      reviewAggs.map(r => [r.revieweeId, { avg: r._avg.rating, count: r._count.rating }])
    )

    const members = circle.memberships.map(m => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      avatar: m.user.avatar,
      role: m.role,
      turn: m.turn,
      reliabilityRate: m.reliabilityRate,
      noShowCount: m.noShowCount,
      totalMealsCooked: m.totalMealsCooked,
      totalMealsReceived: m.totalMealsReceived,
      averageRating: reviewMap[m.userId]?.avg ?? null,
      reviewCount: reviewMap[m.userId]?.count ?? 0,
      dietaryRestrictions: m.user.dietaryRestrictions,
      cookingStyles: m.user.cookingStyles,
    }))

    return {
      ...circle,
      memberCount: circle.memberships.length,
      myRole: myMembership?.role ?? null,
      myTurn: myMembership?.turn ?? null,
      members,
      inviteCode: myMembership ? circle.inviteCode : null,
    }
  }

  async getWeeklySchedule(circleId: string) {
    const memberships = await this.db.circleMembership.findMany({
      where: { circleId, status: 'ACTIVE', turn: { not: null } },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { turn: 'asc' },
    })

    const schedule: Record<string, { userId: string; name: string; avatar: string | null } | null> = {
      MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null,
    }

    for (const m of memberships) {
      if (m.turn) {
        schedule[m.turn] = { userId: m.userId, name: m.user.name, avatar: m.user.avatar }
      }
    }

    const unassignedMembers = await this.db.circleMembership.findMany({
      where: { circleId, status: 'ACTIVE', turn: null },
      include: { user: { select: { id: true, name: true } } },
    })

    return {
      schedule,
      unassignedMembers: unassignedMembers.map(m => ({ userId: m.userId, name: m.user.name })),
      coverageDays: memberships.length,
      totalActiveMembers: memberships.length + unassignedMembers.length,
    }
  }

  async checkDietaryConflicts(circleId: string, newUserRestrictions: string[]) {
    if (!newUserRestrictions.length) return { conflicts: [], compatible: true, warning: null }

    const members = await this.db.circleMembership.findMany({
      where: { circleId, status: 'ACTIVE' },
      include: { user: { select: { name: true, dietaryRestrictions: true } } },
    })

    const strictRestrictions = ['NUT_FREE', 'KOSHER', 'HALAL', 'VEGAN']
    const conflicts: Array<{ memberName: string; restriction: string }> = []

    for (const restriction of newUserRestrictions) {
      for (const m of members) {
        if (
          strictRestrictions.includes(restriction) &&
          !m.user.dietaryRestrictions.includes(restriction as any)
        ) {
          conflicts.push({ memberName: m.user.name, restriction })
        }
      }
    }

    return {
      conflicts: conflicts.slice(0, 5),
      compatible: conflicts.length === 0,
      warning: conflicts.length > 0
        ? `${conflicts.length} potential dietary mismatch(es). Your restrictions will be visible to all circle members.`
        : null,
    }
  }

  generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I ambiguity
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }
}
