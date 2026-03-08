import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth.middleware'
import { CircleService } from '../services/circle.service'
import { NotificationService } from '../services/notification.service'

const CreateCircleSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(500).optional(),
  maxSize: z.number().int().min(3).max(8).default(5),
  neighborhoodName: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isPublic: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
})

const UpdateCircleSchema = CreateCircleSchema.partial()

export async function circleRoutes(app: FastifyInstance) {
  const circleService = new CircleService(prisma)
  const notifService = new NotificationService(prisma)

  // Create circle
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const body = CreateCircleSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { circleMemberships: true },
    })

    if (user?.subscriptionTier === 'FREE') {
      const activeCircles = user.circleMemberships.filter((m: any) => m.status === 'ACTIVE').length
      if (activeCircles >= 1) {
        return reply.code(403).send({
          error: 'Round (free) is limited to 1 circle. Upgrade to Round Member for unlimited circles.',
          upgradeRequired: true,
        })
      }
    }

    const circle = await circleService.createCircle(userId, body)
    return reply.code(201).send(circle)
  })

  // Get circle by ID
  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const circle = await circleService.getCircleWithMembers(id, userId)
    if (!circle) return reply.code(404).send({ error: 'Circle not found' })

    return circle
  })

  // Update circle (owner/admin only)
  app.patch('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!
    const body = UpdateCircleSchema.parse(req.body)

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: id, userId } },
    })
    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return reply.code(403).send({ error: 'Not authorized to update this circle' })
    }

    const circle = await prisma.circle.update({ where: { id }, data: body })
    return circle
  })

  // Disband circle (owner only)
  app.delete('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: id, userId } },
    })
    if (!membership || membership.role !== 'OWNER') {
      return reply.code(403).send({ error: 'Only the circle owner can disband the circle' })
    }

    await prisma.circle.update({ where: { id }, data: { status: 'DISBANDED' } })
    return reply.code(204).send()
  })

  // Get weekly schedule
  app.get('/:id/schedule', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: id, userId } },
    })
    if (!membership || membership.status !== 'ACTIVE') {
      return reply.code(403).send({ error: 'You are not an active member of this circle' })
    }

    return circleService.getWeeklySchedule(id)
  })

  // Assign a turn (cook day) to a member
  app.patch('/:id/turns/:memberId', { preHandler: requireAuth }, async (req, reply) => {
    const { id, memberId } = req.params as { id: string; memberId: string }
    const userId = req.userId!
    const { turn } = req.body as { turn: string }

    const myMembership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: id, userId } },
    })
    if (!myMembership || !['OWNER', 'ADMIN'].includes(myMembership.role)) {
      return reply.code(403).send({ error: 'Only the owner or admin can assign turns' })
    }

    const updated = await prisma.circleMembership.update({
      where: { id: memberId },
      data: { turn: turn as any },
    })
    return updated
  })

  // Confirm your upcoming turn (reliability infrastructure)
  app.post('/:id/turns/confirm', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: id, userId } },
    })
    if (!membership || membership.status !== 'ACTIVE') {
      return reply.code(403).send({ error: 'Not an active member of this circle' })
    }

    const updated = await prisma.circleMembership.update({
      where: { id: membership.id },
      data: { turnConfirmedAt: new Date() },
    })
    return updated
  })

  // Generate new invite code
  app.post('/:id/invite/refresh', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: id, userId } },
    })
    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return reply.code(403).send({ error: 'Not authorized' })
    }

    const newCode = circleService.generateInviteCode()
    const circle = await prisma.circle.update({ where: { id }, data: { inviteCode: newCode } })
    return { inviteCode: circle.inviteCode }
  })

  // Join circle via invite code
  app.post('/join/:inviteCode', { preHandler: requireAuth }, async (req, reply) => {
    const { inviteCode } = req.params as { inviteCode: string }
    const userId = req.userId!

    const circle = await prisma.circle.findUnique({ where: { inviteCode } })
    if (!circle) return reply.code(404).send({ error: 'Invalid invite code' })
    if (circle.status === 'DISBANDED') {
      return reply.code(400).send({ error: 'This circle is no longer active' })
    }

    const existing = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: circle.id, userId } },
    })
    if (existing) {
      if (existing.status === 'ACTIVE') {
        return reply.code(400).send({ error: 'You are already in this circle' })
      }
      const updated = await prisma.circleMembership.update({
        where: { id: existing.id },
        data: { status: circle.requiresApproval ? 'PENDING' : 'ACTIVE', leftAt: null },
      })
      return updated
    }

    // Check capacity
    const activeCount = await prisma.circleMembership.count({
      where: { circleId: circle.id, status: 'ACTIVE' },
    })
    if (activeCount >= circle.maxSize) {
      return reply.code(400).send({ error: 'This circle is full' })
    }

    // Free tier: max 1 circle
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { circleMemberships: true },
    })
    if (user?.subscriptionTier === 'FREE') {
      const active = user.circleMemberships.filter((m: any) => m.status === 'ACTIVE').length
      if (active >= 1) {
        return reply.code(403).send({
          error: 'Round (free) is limited to 1 circle. Upgrade to Round Member.',
          upgradeRequired: true,
        })
      }
    }

    const membership = await prisma.circleMembership.create({
      data: {
        circleId: circle.id,
        userId,
        status: circle.requiresApproval ? 'PENDING' : 'ACTIVE',
        role: 'MEMBER',
      },
    })

    if (!circle.requiresApproval) {
      const newMember = await prisma.user.findUnique({ where: { id: userId } })
      await notifService.notifyCircleMembers(circle.id, {
        type: 'CIRCLE_MEMBER_JOINED',
        title: `${newMember?.name} joined ${circle.name}!`,
        body: 'A new neighbor has joined your circle.',
        excludeUserId: userId,
      })

      if (activeCount + 1 >= 3 && circle.status === 'FORMING') {
        await prisma.circle.update({ where: { id: circle.id }, data: { status: 'ACTIVE' } })
      }
    }

    return reply.code(201).send(membership)
  })

  // Leave circle
  app.delete('/:id/leave', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: id, userId } },
    })
    if (!membership) return reply.code(404).send({ error: 'You are not in this circle' })

    await prisma.circleMembership.update({
      where: { id: membership.id },
      data: { status: 'LEFT', leftAt: new Date(), turn: null },
    })

    return reply.code(204).send()
  })
}
