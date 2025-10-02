import { FastifyInstance } from 'fastify'

const rules: any[] = []

export default async function alertsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/alerts', async (req, reply) => {
    return { rules }
  })

  fastify.post('/api/alerts', async (req, reply) => {
    const rule = req.body
    rules.push(rule)
    return { ok: true, rule }
  })
}
