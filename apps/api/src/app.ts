import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { clerkPlugin } from '@clerk/fastify'

import { authRoutes } from './routes/auth.routes'
import { userRoutes } from './routes/user.routes'
import { circleRoutes } from './routes/circle.routes'
import { mealRoutes } from './routes/meal.routes'
import { reviewRoutes } from './routes/review.routes'
import { notificationRoutes } from './routes/notification.routes'
import { subscriptionRoutes } from './routes/subscription.routes'
import { cronRoutes } from './routes/cron.routes'
import { matchingRoutes } from './routes/matching.routes'
import { errorHandler } from './middleware/error.middleware'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
    },
  })

  await app.register(helmet, { contentSecurityPolicy: false })

  await app.register(cors, {
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      /round\.app$/,
      /localhost/,
    ],
    credentials: true,
  })

  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  if (process.env.NODE_ENV !== 'production') {
    await app.register(swagger, {
      swagger: {
        info: { title: 'Round API', version: '1.0.0', description: 'Community meal co-op' },
        securityDefinitions: {
          bearerAuth: { type: 'apiKey', name: 'Authorization', in: 'header' },
        },
      },
    })
    await app.register(swaggerUi, { routePrefix: '/docs' })
  }

  await app.register(clerkPlugin)

  await app.register(authRoutes,         { prefix: '/auth' })
  await app.register(userRoutes,         { prefix: '/users' })
  await app.register(circleRoutes,       { prefix: '/circles' })
  await app.register(mealRoutes,         { prefix: '/meals' })
  await app.register(reviewRoutes,       { prefix: '/reviews' })
  await app.register(notificationRoutes, { prefix: '/notifications' })
  await app.register(subscriptionRoutes, { prefix: '/subscriptions' })
  await app.register(matchingRoutes,     { prefix: '/matching' })
  await app.register(cronRoutes,          { prefix: '/cron' })

  app.get('/health', async () => ({ status: 'ok', app: 'round', timestamp: new Date().toISOString() }))

  app.setErrorHandler(errorHandler)

  return app
}
