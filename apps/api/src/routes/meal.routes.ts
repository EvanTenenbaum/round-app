import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth.middleware'
import { NotificationService } from '../services/notification.service'

const CreateMealSchema = z.object({
  circleId: z.string(),
  title: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  photo: z.string().url().optional(),
  cuisineType: z.string().max(50).optional(),
  dietaryTags: z.array(z.string()).optional(),
  allergenNotes: z.string().max(500).optional(),
  servingsAvailable: z.number().int().min(1).max(20),
  containerPolicy: z.string().max(200).optional(),
  pickupTime: z.string().datetime(),
  pickupLocation: z.string().max(200),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  pickupNotes: z.string().max(300).optional(),
  cookDate: z.string().datetime(),
})

const UpdateMealSchema = CreateMealSchema.omit({ circleId: true }).partial()

export async function mealRoutes(app: FastifyInstance) {
  const notifService = new NotificationService(prisma)

  // Post a meal
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const body = CreateMealSchema.parse(req.body)

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: body.circleId, userId } },
    })
    if (!membership || membership.status !== 'ACTIVE') {
      return reply.code(403).send({ error: 'You must be an active circle member to post meals' })
    }

    // Use cook's container policy as default if not specified
    const cook = await prisma.user.findUnique({ where: { id: userId }, select: { containerPolicy: true } })
    const containerPolicy =
      body.containerPolicy ??
      cook?.containerPolicy ??
      'Cook provides containers — keep them, no return needed'

    const meal = await prisma.meal.create({
      data: {
        ...body,
        cookId: userId,
        containerPolicy,
        pickupTime: new Date(body.pickupTime),
        cookDate: new Date(body.cookDate),
        status: 'POSTED',
        dietaryTags: (body.dietaryTags as any) || [],
      },
      include: { cook: { select: { id: true, name: true, avatar: true } } },
    })

    await notifService.notifyCircleMembers(body.circleId, {
      type: 'MEAL_POSTED',
      title: `${meal.cook.name} is cooking ${meal.title}!`,
      body: `${meal.servingsAvailable} servings — pickup ${new Date(meal.pickupTime).toLocaleDateString()}`,
      excludeUserId: userId,
      data: { mealId: meal.id, circleId: body.circleId },
    })

    await prisma.circleMembership.update({
      where: { circleId_userId: { circleId: body.circleId, userId } },
      data: { totalMealsCooked: { increment: 1 } },
    })

    return reply.code(201).send(meal)
  })

  // Get meal by ID
  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        cook: { select: { id: true, name: true, avatar: true } },
        seats: {
          include: { diner: { select: { id: true, name: true, avatar: true } } },
        },
        circle: { select: { id: true, name: true } },
      },
    })

    if (!meal) return reply.code(404).send({ error: 'Meal not found' })

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: meal.circleId, userId } },
    })
    if (!membership) return reply.code(403).send({ error: 'Not a member of this circle' })

    const mySeat = meal.seats.find((s: any) => s.dinerId === userId) || null
    return { ...meal, mySeat }
  })

  // Update a meal (cook only, before pickup)
  app.patch('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!
    const body = UpdateMealSchema.parse(req.body)

    const meal = await prisma.meal.findUnique({ where: { id } })
    if (!meal) return reply.code(404).send({ error: 'Meal not found' })
    if (meal.cookId !== userId) return reply.code(403).send({ error: 'Only the cook can edit this meal' })
    if (meal.status === 'DONE') return reply.code(400).send({ error: 'Cannot edit a completed meal' })

    const updated = await prisma.meal.update({
      where: { id },
      data: {
        ...body,
        pickupTime: body.pickupTime ? new Date(body.pickupTime) : undefined,
        cookDate: body.cookDate ? new Date(body.cookDate) : undefined,
        dietaryTags: body.dietaryTags as any,
      },
    })
    return updated
  })

  // Cancel a meal
  app.delete('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const meal = await prisma.meal.findUnique({ where: { id } })
    if (!meal) return reply.code(404).send({ error: 'Meal not found' })
    if (meal.cookId !== userId) return reply.code(403).send({ error: 'Only the cook can cancel this meal' })

    await prisma.meal.update({ where: { id }, data: { status: 'CANCELLED' } })

    // Notify everyone who saved a seat
    const seats = await prisma.seat.findMany({
      where: { mealId: id },
      include: { diner: true },
    })
    for (const seat of seats) {
      await notifService.sendToUser(seat.dinerId, {
        type: 'SYSTEM',
        title: `"${meal.title}" has been cancelled`,
        body: "Your cook had to cancel tonight. Sorry for the short notice!",
        data: { circleId: meal.circleId },
      })
    }

    return reply.code(204).send()
  })

  // Save a seat
  app.post('/:id/seat', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!
    const { portions } = req.body as { portions?: number }

    const meal = await prisma.meal.findUnique({ where: { id } })
    if (!meal) return reply.code(404).send({ error: 'Meal not found' })
    if (meal.cookId === userId) {
      return reply.code(400).send({ error: "You can't save a seat at your own meal" })
    }
    if (meal.status !== 'POSTED') {
      return reply.code(400).send({ error: 'This meal is not available' })
    }

    const portionCount = portions || 1
    if (meal.servingsAvailable - meal.servingsSaved < portionCount) {
      return reply.code(400).send({ error: 'Not enough servings available' })
    }

    const existing = await prisma.seat.findUnique({
      where: { mealId_dinerId: { mealId: id, dinerId: userId } },
    })
    if (existing) return reply.code(400).send({ error: 'You already have a seat at this meal' })

    const [seat] = await prisma.$transaction([
      prisma.seat.create({
        data: { mealId: id, dinerId: userId, portions: portionCount, status: 'CONFIRMED' },
      }),
      prisma.meal.update({
        where: { id },
        data: {
          servingsSaved: { increment: portionCount },
          status:
            meal.servingsSaved + portionCount >= meal.servingsAvailable ? 'FULL' : 'POSTED',
        },
      }),
      prisma.circleMembership.updateMany({
        where: { circleId: meal.circleId, userId },
        data: { totalMealsReceived: { increment: 1 } },
      }),
    ])

    const diner = await prisma.user.findUnique({ where: { id: userId } })
    await notifService.sendToUser(meal.cookId, {
      type: 'SEAT_SAVED',
      title: `${diner?.name} saved a seat!`,
      body: `"${meal.title}" — ${meal.servingsSaved + portionCount}/${meal.servingsAvailable} seats saved`,
      data: { mealId: id },
    })

    return reply.code(201).send(seat)
  })

  // Unsave a seat
  app.delete('/:id/seat', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.userId!

    const seat = await prisma.seat.findUnique({
      where: { mealId_dinerId: { mealId: id, dinerId: userId } },
    })
    if (!seat) return reply.code(404).send({ error: 'No seat found' })

    const meal = await prisma.meal.findUnique({ where: { id } })
    if (!meal) return reply.code(404).send({ error: 'Meal not found' })

    // Can't unsave within 2 hours of pickup
    const cutoff = new Date(meal.pickupTime.getTime() - 2 * 60 * 60 * 1000)
    if (new Date() > cutoff) {
      return reply.code(400).send({
        error: 'Cannot unsave a seat within 2 hours of pickup time',
      })
    }

    await prisma.$transaction([
      prisma.seat.delete({ where: { id: seat.id } }),
      prisma.meal.update({
        where: { id },
        data: { servingsSaved: { decrement: seat.portions }, status: 'POSTED' },
      }),
    ])

    return reply.code(204).send()
  })

  // Get meals for a circle (this week)
  app.get('/circle/:circleId', { preHandler: requireAuth }, async (req, reply) => {
    const { circleId } = req.params as { circleId: string }
    const userId = req.userId!
    const { week } = req.query as { week?: string }

    const membership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId, userId } },
    })
    if (!membership || membership.status !== 'ACTIVE') {
      return reply.code(403).send({ error: 'Not an active member of this circle' })
    }

    const weekStart = week ? new Date(week) : getMonday(new Date())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const meals = await prisma.meal.findMany({
      where: {
        circleId,
        cookDate: { gte: weekStart, lt: weekEnd },
        status: { not: 'CANCELLED' },
      },
      include: {
        cook: { select: { id: true, name: true, avatar: true } },
        seats: {
          select: {
            id: true,
            dinerId: true,
            portions: true,
            status: true,
            diner: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { cookDate: 'asc' },
    })

    return meals
  })
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}
