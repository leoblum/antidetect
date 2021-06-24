
import fastify from 'fastify'
import cors from 'fastify-cors'
import jwt from 'fastify-jwt'

import config from '@/config'
import mongo from '@/db'

export default async function App () {
  const srv = fastify({ logger: { level: 'error', prettyPrint: true } })

  srv.register(cors)
  srv.register(jwt, { secret: config.JWT_SECRET })
  srv.register(mongo, { uri: config.MONGODB_URI })

  await srv.ready()
  return srv
}
