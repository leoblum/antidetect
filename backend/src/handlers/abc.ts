import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

type CB<T> = (req: FastifyRequest<{ Body: FromSchema<T> }>, rep: FastifyReply) => void

async function checkAuth (req: FastifyRequest, rep: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (e) {
    return rep.fail(401, 'invalid_auth_header')
  }
}

export const get = <T>(srv: FastifyInstance, url: string, body: T, handler: CB<T>, auth = false) => {
  const opts = {} as any
  if (auth) opts.preValidation = [checkAuth]
  return srv.get(url, opts, handler)
}

export const post = <T>(srv: FastifyInstance, url: string, body: T, handler: CB<T>, auth = false) => {
  const opts = (body ? { schema: { body } } : {}) as any
  if (auth) opts.preValidation = [checkAuth]
  return srv.post(url, opts, handler)
}
