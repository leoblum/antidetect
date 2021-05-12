const handlers = require('./handlers')
const schemas = require('./schemas')

module.exports = async function (fastify, opts) {
  const {pub, pvt} = fastify

  pub.post('/users/checkEmail', handlers.checkEmail)
  pub.post('/users/confirmEmail', handlers.confirmEmail)

  pub.post('/users/create', handlers.createUser, schemas.registerSchema)
  pub.post('/users/auth', handlers.auth, schemas.authSchema)

  pub.get('/fingerprints', handlers.randomFingerprint)
  pub.get('/fingerprints/variants', handlers.fingerprintVariants)

  pvt.post('/protected', handlers.protected)
}
