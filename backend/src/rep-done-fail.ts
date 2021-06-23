import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyReply {
    done(): any
    done(data: any): any
    done(httpCode: number, data: any): any
    fail(httpCode: number, message: string): any
  }
}

export default fp(async srv => {
  srv.decorateReply('done', function (...args) {
    let code = 200
    let data = {}

    if (args.length === 2) [code, data] = [args[0], args[1]]
    else if (args.length === 1 && Number.isInteger(args[0])) code = args[0]
    else if (args.length === 1 && !Number.isInteger(args[0])) data = args[0]

    data = Object.assign({ success: true }, data)
    return this.code(code).send(data)
  })

  srv.decorateReply('fail', function (code, message) {
    return this.code(code).send({ success: false, message })
  })
})
