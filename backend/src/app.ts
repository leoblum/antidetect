
import fastify from 'fastify'
import cors from 'fastify-cors'
import jwt from 'fastify-jwt'

import config from '@/config'
import db from '@/db'
import routes from '@/handlers'
import mailer from '@/mailer'
import decorators from '@/rep-done-fail'

export default async function App () {
  const srv = fastify({ logger: { level: 'error', prettyPrint: true } })

  srv.register(cors)
  srv.register(jwt, { secret: config.JWT_SECRET })

  srv.register(db)
  srv.register(decorators)
  srv.register(routes)

  // await mailer.init()

  await srv.ready()
  return srv
}
