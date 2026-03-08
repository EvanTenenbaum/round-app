import { PrismaClient } from '@prisma/client'

type User = {
  id: string
  lat: number | null
  lng: number | null
  dietaryRestrictions: string[]
  cookingStyles: string[]
}

export class MatchingService {
  constructor(private db: PrismaClient) {}

  /**
   * Find circles compatible with the requesting user.
   * Round Member+ only.
   */
  async findCompatibleCircles(userId: string, maxDistanceMiles = 2.0) {
    const user = await this.db.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')
    if (!user.lat || !user.lng) throw new Error('Location required for matching')

    const radiusDeg = maxDistanceMiles / 69

    const nearbyCircles = await this.db.circle.findMany({
      where: {
        isPublic: true,
        status: { in: ['FORMING', 'ACTIVE'] },
        lat: { gte: user.lat - radiusDeg, lte: user.lat + radiusDeg },
        lng: { gte: user.lng - radiusDeg, lte: user.lng + radiusDeg },
      },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { user: { select: { id: true, dietaryRestrictions: true } } },
        },
      },
    })

    const scored = nearbyCircles
      .filter((c: any) => c.memberships.length < c.maxSize)
      .map((c: any) => ({ circle: c, score: this.scoreCircleCompatibility(user, c) }))
      .filter(({ score }: { score: number }) => score > 0.3)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 5)

    return scored
  }

  /**
   * Find individual neighbors who want to form a new circle together.
   */
  async findCompatibleUsers(userId: string, maxDistanceMiles = 2.0) {
    const user = await this.db.user.findUnique({ where: { id: userId } })
    if (!user || !user.lat || !user.lng) throw new Error('Location required')

    const radiusDeg = maxDistanceMiles / 69

    const candidates = await this.db.user.findMany({
      where: {
        id: { not: userId },
        isActive: true,
        lat: { gte: user.lat - radiusDeg, lte: user.lat + radiusDeg },
        lng: { gte: user.lng - radiusDeg, lte: user.lng + radiusDeg },
        matchingProfile: { isLookingForCircle: true },
      },
      include: { matchingProfile: true },
    })

    const scored = candidates
      .map((c: any) => ({ user: c, score: this.scoreUserCompatibility(user, c) }))
      .filter(({ score }: { score: number }) => score > 0.4)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 10)

    return scored
  }

  // Keep findCompatiblePods as alias so matching.routes.ts call still works
  findCompatiblePods = this.findCompatibleCircles

  private scoreCircleCompatibility(user: User, circle: any): number {
    let score = 0

    // 1. Dietary compatibility (0–0.4)
    const circleDietary = new Set<string>(
      circle.memberships.flatMap((m: any): string[] => m.user.dietaryRestrictions)
    )
    const userRestrictions = new Set(user.dietaryRestrictions)
    const incompatible = [...userRestrictions].filter(r => !circleDietary.has(r))
    score += incompatible.length === 0
      ? 0.4
      : 0.4 * (1 - incompatible.length / Math.max(userRestrictions.size, 1))

    // 2. Distance (0–0.3) — closer is better
    if (user.lat && user.lng && circle.lat && circle.lng) {
      const dist = this.haversineDistance(user.lat, user.lng, circle.lat, circle.lng)
      score += Math.max(0, 0.3 * (1 - dist / 2))
    }

    // 3. Circle size preference (0–0.2)
    const idealSize = 4
    const sizeDiff = Math.abs(circle.maxSize - idealSize)
    score += 0.2 * (1 - sizeDiff / 5)

    // 4. Reliability baseline (0–0.1)
    score += 0.1

    return Math.min(1, score)
  }

  private scoreUserCompatibility(user: User, candidate: User): number {
    let score = 0

    const userSet = new Set(user.dietaryRestrictions)
    const candidateSet = new Set(candidate.dietaryRestrictions)
    const conflicts = [...userSet].filter(r => !candidateSet.has(r)).length
    score += conflicts === 0 ? 0.5 : 0.5 * (1 - conflicts / Math.max(userSet.size, 1))

    if (user.lat && user.lng && candidate.lat && candidate.lng) {
      const dist = this.haversineDistance(user.lat, user.lng, candidate.lat, candidate.lng)
      score += Math.max(0, 0.3 * (1 - dist / 2))
    }

    const userStyles = new Set(user.cookingStyles as string[])
    const overlap = candidate.cookingStyles.filter((s: string) => userStyles.has(s)).length
    score += Math.min(0.2, overlap * 0.05)

    return Math.min(1, score)
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180
  }
}
