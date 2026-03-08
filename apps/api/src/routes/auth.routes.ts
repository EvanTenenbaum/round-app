// apps/api/src/routes/auth.routes.ts
// Clerk webhook handler — syncs Clerk user creation to our Postgres DB

import { FastifyInstance } from 'fastify'
import { Webhook } from 'svix'
import { prisma } from '../db/client'

export async function authRoutes(app: FastifyInstance) {
  // Clerk sends a webhook on user.created / user.updated / user.deleted
  app.post('/webhook', async (req, reply) => {
    const payload = req.rawBody as Buffer
    const headers = req.headers

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
    let event: any

    try {
      event = wh.verify(payload, {
        'svix-id': headers['svix-id'] as string,
        'svix-timestamp': headers['svix-timestamp'] as string,
        'svix-signature': headers['svix-signature'] as string,
      })
    } catch {
      return reply.code(400).send({ error: 'Invalid webhook signature' })
    }

    if (event.type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = event.data
      const email = email_addresses[0]?.email_address
      if (!email) return reply.code(400).send({ error: 'No email found' })

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {},
        create: {
          clerkId: id,
          email,
          name: [first_name, last_name].filter(Boolean).join(' ') || email.split('@')[0],
          avatar: image_url,
        },
      })
    }

    if (event.type === 'user.deleted') {
      await prisma.user.updateMany({
        where: { clerkId: event.data.id },
        data: { isActive: false },
      })
    }

    return reply.code(200).send({ received: true })
  })
}
