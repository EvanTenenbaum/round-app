// apps/api/src/routes/notification.routes.ts

import { FastifyInstance } from 'fastify'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth.middleware'

export async function notificationRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return notifications
  })

  app.patch('/:id/read', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif || notif.userId !== userId) return reply.code(404).send()

    await prisma.notification.update({ where: { id }, data: { read: true } })
    return reply.code(204).send()
  })

  app.patch('/read-all', { preHandler: requireAuth }, async (req, reply) => {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, read: false },
      data: { read: true },
    })
    return reply.code(204).send()
  })
}
