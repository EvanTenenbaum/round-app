// Round — Cron routes
// Called by Railway cron or an external scheduler
// Protected by CRON_SECRET header

import { FastifyInstance } from 'fastify'
import { prisma } from '../db/client'
import { NotificationService } from '../services/notification.service'

const DAY_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
}

function requireCronSecret(req: any, reply: any, done: () => void) {
  const secret = req.headers['x-cron-secret']
  if (!secret || secret !== process.env.CRON_SECRET) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
  done()
}

export async function cronRoutes(app: FastifyInstance) {
  const notifService = new NotificationService(prisma)

  /**
   * POST /cron/turn-reminders
   * Run nightly at 7pm.
   * Notifies members whose turn is tomorrow.
   */
  app.post('/turn-reminders', { preHandler: requireCronSecret }, async (req, reply) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDayIndex = tomorrow.getDay()
    const tomorrowDayKey = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === tomorrowDayIndex)

    if (!tomorrowDayKey) return reply.send({ sent: 0 })

    const memberships = await prisma.circleMembership.findMany({
      where: {
        turn: tomorrowDayKey as any,
        status: 'ACTIVE',
        circle: { status: 'ACTIVE' },
      },
      include: {
        user: { select: { id: true, name: true } },
        circle: { select: { id: true, name: true } },
      },
    })

    let sent = 0
    for (const m of memberships) {
      await notifService.sendToUser(m.userId, {
        type: 'TURN_REMINDER',
        title: "Your turn is tomorrow 🍳",
        body: `It's your turn to cook for ${m.circle.name}. Post your meal when you know what you're making.`,
        data: { circleId: m.circleId },
      })
      sent++
    }

    return reply.send({ sent, day: tomorrowDayKey })
  })

  /**
   * POST /cron/turn-confirm-requests
   * Run morning of cook day at 7am.
   * Requests confirmation from cooks who haven't confirmed yet.
   * This is the reliability infrastructure core — if a cook goes silent,
   * circle members see the warning and can plan accordingly.
   */
  app.post('/turn-confirm-requests', { preHandler: requireCronSecret }, async (req, reply) => {
    const todayDayIndex = new Date().getDay()
    const todayDayKey = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === todayDayIndex)

    if (!todayDayKey) return reply.send({ sent: 0 })

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)

    const memberships = await prisma.circleMembership.findMany({
      where: {
        turn: todayDayKey as any,
        status: 'ACTIVE',
        circle: { status: 'ACTIVE' },
        // Only ping those who haven't confirmed in the last 6 hours
        OR: [
          { turnConfirmedAt: null },
          { turnConfirmedAt: { lt: sixHoursAgo } },
        ],
      },
      include: {
        user: { select: { id: true } },
        circle: { select: { id: true, name: true } },
      },
    })

    let sent = 0
    for (const m of memberships) {
      await notifService.sendToUser(m.userId, {
        type: 'TURN_CONFIRM_REQUEST',
        title: "Are you cooking tonight?",
        body: `Your circle is counting on you. Tap to confirm you're cooking for ${m.circle.name} tonight.`,
        data: { circleId: m.circleId, action: 'confirm_turn' },
      })
      sent++
    }

    return reply.send({ sent, day: todayDayKey })
  })

  /**
   * POST /cron/pickup-reminders
   * Run every hour.
   * Sends pickup reminders to diners with a seat saved in the next 60 minutes.
   */
  app.post('/pickup-reminders', { preHandler: requireCronSecret }, async (req, reply) => {
    const now = new Date()
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000)
    const inFiftyMin = new Date(now.getTime() + 50 * 60 * 1000)

    const seats = await prisma.seat.findMany({
      where: {
        status: 'CONFIRMED',
        meal: {
          pickupTime: { gte: inFiftyMin, lte: inOneHour },
          status: { in: ['POSTED', 'FULL'] },
        },
      },
      include: {
        meal: { select: { title: true, pickupTime: true, pickupLocation: true, circleId: true } },
        diner: { select: { id: true } },
      },
    })

    let sent = 0
    for (const seat of seats) {
      const pickupTime = new Date(seat.meal.pickupTime)
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

      await notifService.sendToUser(seat.dinerId, {
        type: 'PICKUP_REMINDER',
        title: `Pickup in ~1 hour`,
        body: `"${seat.meal.title}" is ready at ${pickupTime} — ${seat.meal.pickupLocation}`,
        data: { circleId: seat.meal.circleId },
      })
      sent++
    }

    return reply.send({ sent })
  })

  /**
   * POST /cron/reliability-update
   * Run nightly at midnight.
   * Marks missed turns (no meal posted, no confirmation, no cancellation) as no-shows
   * and updates reliability scores.
   */
  app.post('/reliability-update', { preHandler: requireCronSecret }, async (req, reply) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDayIndex = yesterday.getDay()
    const yesterdayDayKey = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === yesterdayDayIndex)

    if (!yesterdayDayKey) return reply.send({ updated: 0 })

    // Find members whose turn was yesterday and posted no meal
    const memberships = await prisma.circleMembership.findMany({
      where: {
        turn: yesterdayDayKey as any,
        status: 'ACTIVE',
        circle: { status: 'ACTIVE' },
      },
      include: {
        user: { select: { id: true } },
        circle: { select: { id: true } },
      },
    })

    let updated = 0
    for (const m of memberships) {
      const startOfYesterday = new Date(yesterday)
      startOfYesterday.setHours(0, 0, 0, 0)
      const endOfYesterday = new Date(yesterday)
      endOfYesterday.setHours(23, 59, 59, 999)

      const postedMeal = await prisma.meal.findFirst({
        where: {
          circleId: m.circleId,
          cookId: m.userId,
          cookDate: { gte: startOfYesterday, lte: endOfYesterday },
          status: { not: 'CANCELLED' },
        },
      })

      if (!postedMeal) {
        // Count as no-show — update reliability score
        const newNoShowCount = m.noShowCount + 1
        // Reliability = 1 - (no-shows / total assigned turns so far)
        // Approximate total turns from weeks since joining
        const weeksSinceJoining = Math.max(
          1,
          Math.floor((Date.now() - m.joinedAt.getTime()) / (7 * 24 * 60 * 60 * 1000))
        )
        const reliabilityRate = Math.max(0, 1 - newNoShowCount / weeksSinceJoining)

        await prisma.circleMembership.update({
          where: { id: m.id },
          data: { noShowCount: newNoShowCount, reliabilityRate },
        })

        // Also update user-level reliability score (avg across circles)
        const allMemberships = await prisma.circleMembership.findMany({
          where: { userId: m.userId, status: 'ACTIVE' },
          select: { reliabilityRate: true },
        })
        const avgReliability =
          allMemberships.reduce((sum, x) => sum + x.reliabilityRate, 0) / allMemberships.length

        await prisma.user.update({
          where: { id: m.userId },
          data: { reliabilityScore: avgReliability },
        })

        updated++
      }
    }

    return reply.send({ updated, day: yesterdayDayKey })
  })
}
