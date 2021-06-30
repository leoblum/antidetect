import { Static } from '@sinclair/typebox'
import { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify'
import fp from 'fastify-plugin'

type AuthPayload = {
  userId: string
  teamId: string
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

declare module 'fastify-jwt' {
  interface FastifyJWT {
    payload: AuthPayload
  }
}

type RouteData = { handler: (req: FastifyRequest, rep: FastifyReply) => void, opts: RouteShorthandOptions }

async function checkAuth (req: FastifyRequest, rep: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch (e) {
    return rep.fail('invalid_auth_header', 401)
  }
}

type Ops<B, P, Q> = { body?: B, params?: P, query?: Q }
type Req<B, P, Q> = FastifyRequest<{ Body: B, Params: P, Querystring: Q }>
type Rep = FastifyReply

export const handlerFunc = <B, P, Q>(opts: Ops<B, P, Q> = {}) => {
  type Body = Static<typeof opts.body>
  type Query = Static<typeof opts.query>
  type Params = Static<typeof opts.params>

  type PubCb = (req: Req<Body, Params, Query>, rep: Rep) => void
  type PvtCb = (req: Req<Body, Params, Query> & { user: AuthPayload }, rep: Rep) => void
  type AnyCb = PubCb | PvtCb

  const f = (cb: AnyCb, auth = false) => {
    const data: RouteShorthandOptions = {
      schema: { body: opts?.body, params: opts?.params },
      preValidation: auth ? [checkAuth] : [],
    }
    return { handler: cb, opts: data } as RouteData
  }

  return {
    public: (cb: PubCb) => f(cb, false),
    private: (cb: PvtCb) => f(cb, true),
  }
}

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
