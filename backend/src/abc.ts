import type { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify'
import fp from 'fastify-plugin'
import type { FromSchema } from 'json-schema-to-ts'

type AuthPayload = {
  user: {
    team: string
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    Router: {
      get(url: string, data: RouteData): void
      post(url: string, data: RouteData): void
    }
  }

  interface FastifyReply {
    done(data?: any, httpCode?: number): FastifyReply
    fail(message: string, httpCode: number): FastifyReply
  }
}

async function checkAuth (req: FastifyRequest, rep: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (e) {
    return rep.fail('invalid_auth_header', 401)
  }
}

type Req<B, P> = FastifyRequest<{ Body: FromSchema<B>, Params: FromSchema<P> }>

type Opts<B, P> = { body?: B, params?: P, auth?: boolean } | null
type PubHandler<B, P> = (req: Req<B, P>, rep: FastifyReply) => void
type PvtHandler<B, P> = (req: Req<B, P> & AuthPayload, rep: FastifyReply) => void
type AnyHandler<B, P> = PubHandler<B, P> | PvtHandler<B, P>

type RouteData = { handler: (req: FastifyRequest, rep: FastifyReply) => void, opts: RouteShorthandOptions }

const handler = <B, P>(opts: Opts<B, P> = null, f: AnyHandler<B, P>) => {
  const data: RouteShorthandOptions = {
    schema: { body: opts?.body, params: opts?.params },
    preValidation: opts?.auth ? [checkAuth] : [],
  }
  return { handler: f, opts: data } as RouteData
}

export const pubHandler = <B, P>(opts: Opts<B, P> = null, f: PubHandler<B, P>) => handler({ ...opts, auth: false }, f)
export const pvtHandler = <B, P>(opts: Opts<B, P> = null, f: PvtHandler<B, P>) => handler({ ...opts, auth: true }, f)

export default fp(async (srv) => {
  const get = (url: string, data: RouteData) => srv.get(url, data.opts, data.handler)
  const post = (url: string, data: RouteData) => srv.post(url, data.opts, data.handler)
  srv.decorate('Router', { get, post })

  srv.decorateReply('done', function (this: FastifyReply, data: any = {}, httpCode = 200) {
    return this.code(httpCode).send({ success: true, ...data })
  })

  srv.decorateReply('fail', function (this: FastifyReply, message: string, httpCode: number) {
    return this.code(httpCode).send({ success: false, message })
  })
})
