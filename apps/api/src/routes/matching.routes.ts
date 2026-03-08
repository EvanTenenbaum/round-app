// Round — Matching routes (Round Member+ feature)
// Helps users find compatible circles and neighbors near them

import { FastifyInstance } from 'fastify'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth.middleware'
import { MatchingService } from '../services/matching.service'

export async function matchingRoutes(app: FastifyInstance) {
  const matchingService = new MatchingService(prisma)

  // Get matching suggestions (Round Member+ only)
  app.get('/suggestions', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (user?.subscriptionTier === 'FREE') {
      return reply.code(403).send({
        error: 'Circle matching is a Round Member feature. Upgrade to find neighbors automatically.',
        upgradeRequired: true,
      })
    }

    if (!user?.lat || !user?.lng) {
      return reply.code(400).send({
        error: 'Please add your location in profile settings to use matching.',
      })
    }

    const { type = 'circles', maxDistance } = req.query as {
      type?: 'circles' | 'neighbors'
      maxDistance?: string
    }
    const distanceMiles = parseFloat(maxDistance || '2')

    if (type === 'neighbors') {
      return matchingService.findCompatibleUsers(userId, distanceMiles)
    }

    return matchingService.findCompatiblePods(userId, distanceMiles)
  })

  // Opt in to matching
  app.post('/request', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!

    await prisma.matchingProfile.upsert({
      where: { userId },
      update: { isLookingForCircle: true, updatedAt: new Date() },
      create: { userId, isLookingForCircle: true },
    })

    return { message: 'You are now visible to neighbors looking for a circle.' }
  })

  // Opt out
  app.delete('/request', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    await prisma.matchingProfile.updateMany({
      where: { userId },
      data: { isLookingForCircle: false },
    })
    return reply.code(204).send()
  })
}
