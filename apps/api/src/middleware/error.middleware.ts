import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: 'Validation error',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return reply.code(409).send({ error: 'A record with this value already exists' })
  }
  if (error.code === 'P2025') {
    return reply.code(404).send({ error: 'Record not found' })
  }

  // Log unexpected errors
  if (!error.statusCode || error.statusCode >= 500) {
    request.log.error({ err: error }, 'Unhandled error')
  }

  return reply.code(error.statusCode || 500).send({
    error: error.message || 'Internal server error',
  })
}
