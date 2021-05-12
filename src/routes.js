const handlers = require('./../handlers')
const schemas = require('./../schemas')

module.exports = async function (fastify, opts) {
  function r (method, url, handler, schema = null, opts = null) {
    opts = opts || {}
    opts.method = method.toUpperCase()
    opts.url = url
    opts.handler = handler
    opts.schema = schema
    return fastify.route(opts)
  }

  r('post', '/users/checkEmail', handlers.checkEmail)
  r('post', '/users/register', handlers.register, schemas.registerSchema)
  r('post', '/users/auth', handlers.auth, schemas.authSchema)

  r('get', '/fingerprints', handlers.randomFingerprint)
  r('get', '/fingerprints/variants', handlers.fingerprintVariants)
}
