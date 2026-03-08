import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth.middleware'

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).optional().nullable(),
  neighborhoodName: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergenNotes: z.string().max(500).optional().nullable(),
  portionSize: z.enum(['SMALL', 'STANDARD', 'LARGE']).optional(),
  cookingStyles: z.array(z.string().max(50)).max(10).optional(),
  cookingSkillLevel: z.number().int().min(1).max(5).optional(),
  containerPolicy: z.string().max(200).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
})

export async function userRoutes(app: FastifyInstance) {
  // GET /users/me
  app.get('/me', { preHandler: requireAuth }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        subscription: {
          select: {
            tier: true,
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            isFounding: true,
          },
        },
        matchingProfile: {
          select: { isLookingForCircle: true, maxDistanceMiles: true },
        },
        _count: { select: { mealsCooked: true } },
      },
    })
    if (!user) return reply.code(404).send({ error: 'User not found' })
    const { clerkId, expoPushToken, ...safeUser } = user
    return safeUser
  })

  // PATCH /users/me
  app.patch('/me', { preHandler: requireAuth }, async (req, reply) => {
    const body = UpdateProfileSchema.parse(req.body)
    const updated = await prisma.user.update({
      where: { id: req.userId! },
      data: { ...body, dietaryRestrictions: body.dietaryRestrictions as any },
    })
    const { clerkId, expoPushToken, ...safeUser } = updated
    return safeUser
  })

  // GET /users/me/circles
  app.get('/me/circles', { preHandler: requireAuth }, async (req, reply) => {
    const memberships = await prisma.circleMembership.findMany({
      where: { userId: req.userId!, status: 'ACTIVE' },
      include: {
        circle: {
          include: {
            _count: { select: { memberships: { where: { status: 'ACTIVE' } } } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })
    return memberships.map(m => ({
      id: m.circle.id,
      name: m.circle.name,
      description: m.circle.description,
      inviteCode: m.circle.inviteCode,
      status: m.circle.status,
      maxSize: m.circle.maxSize,
      neighborhoodName: m.circle.neighborhoodName,
      city: m.circle.city,
      memberCount: m.circle._count.memberships,
      myRole: m.role,
      myTurn: m.turn,
      totalMealsCooked: m.totalMealsCooked,
      totalMealsReceived: m.totalMealsReceived,
    }))
  })

  // POST /users/me/push-token
  app.post('/me/push-token', { preHandler: requireAuth }, async (req, reply) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body)
    await prisma.user.update({ where: { id: req.userId! }, data: { expoPushToken: token } })
    return reply.code(204).send()
  })

  // DELETE /users/me/push-token — call on logout
  app.delete('/me/push-token', { preHandler: requireAuth }, async (req, reply) => {
    await prisma.user.update({ where: { id: req.userId! }, data: { expoPushToken: null } })
    return reply.code(204).send()
  })

  // GET /users/:id — public profile
  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user = await prisma.user.findUnique({
      where: { id, isActive: true },
      select: {
        id: true, name: true, avatar: true, bio: true,
        neighborhoodName: true, city: true,
        dietaryRestrictions: true, allergenNotes: true,
        cookingStyles: true, cookingSkillLevel: true,
        containerPolicy: true, reliabilityScore: true,
        createdAt: true,
        _count: { select: { mealsCooked: true } },
      },
    })
    if (!user) return reply.code(404).send({ error: 'User not found' })
    const reviews = await prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })
    return {
      ...user,
      averageRating: reviews._avg.rating,
      totalReviews: reviews._count.rating,
      totalMealsCooked: user._count.mealsCooked,
    }
  })

  // DELETE /users/me/account — GDPR soft delete
  app.delete('/me/account', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          email: `deleted_${userId}@deleted.round`,
          name: 'Deleted User',
          avatar: null, bio: null, lat: null, lng: null,
          neighborhoodName: null, expoPushToken: null,
        },
      }),
      prisma.circleMembership.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'LEFT', leftAt: new Date() },
      }),
    ])
    return reply.code(204).send()
  })
}
