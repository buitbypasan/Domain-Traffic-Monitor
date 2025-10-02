import Fastify from 'fastify'
import cors from '@fastify/cors
import eventsRoutes from './routes/events'
import alertsRoutes from './routes/alerts'

const fastify = Fastify({ logger: true })
fastify.register(cors as any, { origin: true })

declare module 'fastify' {
  interface FastifyInstance {
    sse?: { send: (s: string) => void }
  }
}

fastify.register(eventsRoutes)
fastify.register(alertsRoutes)

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
