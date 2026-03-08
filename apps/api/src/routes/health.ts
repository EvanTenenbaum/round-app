import { FastifyInstance } from 'fastify'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (req, reply) => {
    return { status: 'ok', ts: Date.now() }
  })
}
