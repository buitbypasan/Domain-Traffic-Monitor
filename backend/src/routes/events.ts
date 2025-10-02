import { FastifyInstance } from 'fastify'
import { insertEvent, queryEvents, getOverview } from '../db'

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/api/overview', async (req, reply) => {
    const overview = getOverview()
    return overview
  })

  fastify.get('/api/events', async (req, reply) => {
    const { q, limit, from, to } = req.query as any
    const rows = queryEvents({ q, limit, from, to })
    return { rows }
  })

  fastify.post('/api/events', async (req, reply) => {
    const event = req.body as any
    if (!event.timestamp) event.timestamp = new Date().toISOString()
    const id = insertEvent(event)
    fastify.sse?.send(JSON.stringify(event))
    return { ok: true, id }
  })

  fastify.get('/api/live', (req, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')
    const send = (data: string) => {
      reply.raw.write(`data: ${data}\n\n`)
    }
    const interval = setInterval(() => send(JSON.stringify({ heartbeat: new Date().toISOString() })), 15000)
    fastify.sse = { send }
    req.raw.on('close', () => {
      clearInterval(interval)
    })
  })
}
