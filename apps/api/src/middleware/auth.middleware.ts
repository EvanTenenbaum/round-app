import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../db/client'

// Extend Fastify request type
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    clerkUserId?: string
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    // Clerk adds auth() to the request via clerkPlugin
    const auth = req.auth as any
    if (!auth || !auth.userId) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    req.clerkUserId = auth.userId

    // Look up our internal user
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { id: true, isActive: true },
    })

    if (!user) {
      return reply.code(401).send({ error: 'User not found. Please complete onboarding.' })
    }

    if (!user.isActive) {
      return reply.code(403).send({ error: 'Account suspended' })
    }

    req.userId = user.id
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' })
  }
}

export async function optionalAuth(req: FastifyRequest, _reply: FastifyReply) {
  try {
    const auth = req.auth as any
    if (!auth?.userId) return

    req.clerkUserId = auth.userId
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { id: true },
    })
    if (user) req.userId = user.id
  } catch {
    // no-op — optional auth
  }
}
