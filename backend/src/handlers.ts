import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import type { FromSchema } from 'json-schema-to-ts'

import { users } from './models'

type Func<B, P> = (req: FastifyRequest<{ Body: FromSchema<B>, Params: FromSchema<P> }>, rep: FastifyReply) => void
type Opts<B, P> = { body?: B, params?: P }

const router = (srv: FastifyInstance) => {
  const req = async <B, P>(method: 'GET' | 'POST', url: string, handler: Func<B, P>, opts?: Opts<B, P>) => {
    const schema = { body: opts?.body, params: opts?.params }
    return srv.route({ method, url, handler, schema })
  }

  const get = async <B, P>(url: string, handler: Func<B, P>, opts?: Opts<B, P>) => req('GET', url, handler, opts)
  const post = async <B, P>(url: string, handler: Func<B, P>, opts?: Opts<B, P>) => req('POST', url, handler, opts)

  return { get, post }
}

const UserCreate = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const

const UserParams = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
  additionalProperties: false,
} as const

export default fp(async (srv) => {
  const { get, post } = router(srv)

  // Create new user
  post('/users', async (req, rep) => {
    const email = req.body.email
    const password = await bcrypt.hash(req.body.password, 10)

    if (await users.coll.findOne({ email })) return

    const createdAt = new Date()
    const updatedAt = new Date()

    const user = await users.coll.insertOne({ email, password, createdAt, updatedAt })

    // if (await UserModel.findOne({ email })) return rep.fail('email_already_used', 412)
  }, { body: UserCreate })
})
