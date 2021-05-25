const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, tops) {
  /* @ decorate fastify */

  // fastify.decorateRequest('fastify', {
  //   getter: () => fastify,
  // })

  async function auth (req, rep) {
    try {
      await req.jwtVerify()
    } catch (e) {
      console.log(e.toString())
      return rep.fail(401, 'invalid_auth_header')
    }
  }

  function pub (method, url, handler, schema = null, opts = {}) {
    opts = Object.assign({ method: method.toUpperCase(), url, handler, schema }, opts)
    return fastify.route(opts)
  }

  function pvt (method, url, handler, schema = null, opts = {}) {
    opts.preValidation = opts.preValidation || [auth]
    return pub(method, url, handler, schema, opts)
  }

  const methods = ['get', 'post', 'put', 'options', 'delete', 'head', 'patch', 'all']
  for (const method of methods) {
    pub[method] = (...args) => pub(method, ...args)
    pvt[method] = (...args) => pvt(method, ...args)
  }

  fastify.decorate('pub', pub) // To define public routes
  fastify.decorate('pvt', pvt) // To define private routes

  /* @ decorate reply */

  fastify.decorateReply('done', function (...args) {
    let code = 200
    let data = {}

    if (args.length === 2) [code, data] = [args[0], args[1]]
    else if (args.length === 1 && Number.isInteger(args[0])) code = args[0]
    else if (args.length === 1 && !Number.isInteger(args[0])) data = args[0]

    data = Object.assign({ success: true }, data)
    // console.log(code, data, this.request.url, args)
    return this.code(code).send(data)
  })

  fastify.decorateReply('fail', function (code, message) {
    return this.code(code).send({ success: false, message })
  })
})
