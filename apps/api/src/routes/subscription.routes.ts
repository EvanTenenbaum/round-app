import { FastifyInstance } from 'fastify'
import Stripe from 'stripe'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth.middleware'
import { TIER_LABELS } from '@round/shared'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PRICES = {
  member_monthly:  process.env.STRIPE_PRICE_MONTHLY!,  // Round Member $7.99/mo
  member_annual:   process.env.STRIPE_PRICE_ANNUAL!,   // Round Member $59/yr
  founding_member: process.env.STRIPE_PRICE_FOUNDING!, // Founding Member $49 one-time (launch only)
}

export async function subscriptionRoutes(app: FastifyInstance) {
  // Get subscription status
  app.get('/status', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })
    const tier = (user?.subscriptionTier || 'FREE') as keyof typeof TIER_LABELS
    return {
      tier,
      label: TIER_LABELS[tier],
      isFounding: user?.subscription?.isFounding || false,
      currentPeriodEnd: user?.subscription?.currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: user?.subscription?.cancelAtPeriodEnd || false,
    }
  })

  // Create checkout session
  app.post('/checkout', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const { priceKey, successUrl, cancelUrl } = req.body as {
      priceKey: keyof typeof PRICES
      successUrl: string
      cancelUrl: string
    }

    const priceId = PRICES[priceKey]
    if (!priceId) return reply.code(400).send({ error: 'Invalid price' })

    const user = await prisma.user.findUnique({ where: { id: userId } })

    let sub = await prisma.subscription.findUnique({ where: { userId } })
    let customerId = sub?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.name,
        metadata: { roundUserId: userId },
      })
      customerId = customer.id

      await prisma.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId: customerId },
        create: {
          userId,
          stripeCustomerId: customerId,
          tier: 'FREE',
          status: 'ACTIVE',
        },
      })
    }

    const isFounding = priceKey === 'founding_member'
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isFounding ? 'payment' : 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { roundUserId: userId, priceKey },
    })

    return { url: session.url }
  })

  // Customer portal (manage subscription)
  app.post('/portal', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.userId!
    const { returnUrl } = req.body as { returnUrl: string }

    const sub = await prisma.subscription.findUnique({ where: { userId } })
    if (!sub) return reply.code(400).send({ error: 'No subscription found' })

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  })

  // Stripe webhook
  app.post('/webhook', async (req, reply) => {
    const sig = req.headers['stripe-signature'] as string
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch {
      return reply.code(400).send({ error: 'Invalid webhook signature' })
    }

    await handleStripeEvent(event)
    return reply.code(200).send({ received: true })
  })
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.roundUserId
      const priceKey = session.metadata?.priceKey
      if (!userId) return

      if (priceKey === 'founding_member') {
        await prisma.$transaction([
          prisma.user.update({ where: { id: userId }, data: { subscriptionTier: 'FOUNDING' } }),
          prisma.subscription.update({
            where: { userId },
            data: { tier: 'FOUNDING', isFounding: true, status: 'ACTIVE' },
          }),
        ])
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      const userId = (customer as Stripe.Customer).metadata?.roundUserId
      if (!userId) return

      const isActive = sub.status === 'active' || sub.status === 'trialing'
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { subscriptionTier: isActive ? 'MEMBER' : 'FREE' },
        }),
        prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            tier: isActive ? 'MEMBER' : 'FREE',
            status: sub.status as any,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        }),
      ])
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      const userId = (customer as Stripe.Customer).metadata?.roundUserId
      if (!userId) return

      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { subscriptionTier: 'FREE' } }),
        prisma.subscription.update({
          where: { userId },
          data: { tier: 'FREE', status: 'CANCELLED' },
        }),
      ])
      break
    }
  }
}
