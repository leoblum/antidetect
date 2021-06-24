import { FastifyReply } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyReply {
    done(data?: any, httpCode?: number): FastifyReply
    fail(message: string, httpCode: number): FastifyReply
  }
}

export default fp(async (srv, opts) => {
  srv.decorateReply('done', function (this: FastifyReply, data: any = {}, httpCode = 200) {
    return this.code(httpCode).send({ success: true, ...data })
  })

  srv.decorateReply('fail', function (this: FastifyReply, message: string, httpCode: number) {
    return this.code(httpCode).send({ success: false, message })
  })
})
