// apps/api/src/routes/review.routes.ts

import { FastifyInstance } from 'fastify'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth.middleware'

export async function reviewRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const { mealId, rating, comment, type } = req.body as any

    // Verify user claimed this meal and it's completed
    const claim = await prisma.seat.findUnique({
      where: { mealId_dinerId: { mealId, dinerId: userId } },
    })
    if (!claim) return reply.code(403).send({ error: 'You must have claimed this meal to review it' })

    // Check not already reviewed
    const existing = await prisma.review.findUnique({
      where: { mealId_reviewerId_type: { mealId, reviewerId: userId, type } },
    })
    if (existing) return reply.code(400).send({ error: 'Already reviewed' })

    const meal = await prisma.meal.findUnique({ where: { id: mealId } })
    if (!meal) return reply.code(404).send({ error: 'Meal not found' })

    if (rating < 1 || rating > 5) return reply.code(400).send({ error: 'Rating must be 1–5' })

    const review = await prisma.review.create({
      data: { mealId, reviewerId: userId, revieweeId: meal.cookId, rating, comment, type },
    })

    return reply.code(201).send(review)
  })

  app.get('/user/:userId', { preHandler: requireAuth }, async (req, reply) => {
    const { userId } = req.params as { userId: string }
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    const avg = reviews.length ? reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length : null
    return { reviews, averageRating: avg, totalReviews: reviews.length }
  })
}
