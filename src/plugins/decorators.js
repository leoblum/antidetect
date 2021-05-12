const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, tops) {
  fastify.decorateRequest('fastify', fastify)

  fastify.decorateReply('done', function (...args) {
    let code = 200
    let data = {}

    if (args.length === 2) [code, data] = [args[0], args[1]]
    else if (args.length === 1 && Number.isInteger(args[0])) code = args[0]
    else if (args.length === 1 && !Number.isInteger(args[0])) data = args[0]

    data = Object.assign({success: true}, data)
    // console.log(code, data, this.request.url, args)
    return this.code(code).send(data)
  })

  fastify.decorateReply('fail', function (code, message) {
    return this.code(code).send({success: false, message})
  })
})
