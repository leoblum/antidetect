import fastify from 'fastify'
import cors from 'fastify-cors'
import jwt from 'fastify-jwt'

import abc from './abc'
import config from './config'
import db from './db'
import routes from './routes'

export default async function App () {
  const srv = fastify({ logger: { level: 'error', prettyPrint: true } })

  srv.register(cors)
  srv.register(jwt, { secret: config.JWT_SECRET })

  srv.register(db, { uri: config.MONGODB_URI })
  srv.register(abc)

  srv.register(routes)
  await srv.ready()
  return srv
}
