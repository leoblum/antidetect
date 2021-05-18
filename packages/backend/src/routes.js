const handlers = require('./handlers')
const schemas = require('./schemas')

module.exports = async function (fastify, opts) {
  const {pub, pvt} = fastify
  // todo: add custom error handler to have same api for all reps: .success, .message

  // @Public

  pub.post('/users/checkEmail', handlers.checkEmail)
  pub.post('/users/confirmEmail', handlers.confirmEmail)

  pub.post('/users/create', handlers.createUser, schemas.UserCreateSchema)
  pub.post('/users/login', handlers.login, schemas.UserAuthSchema)

  pub.post('/users/reset-password', handlers.resetPassword)

  // @Private

  pvt.get('/protected', handlers.protected)
  pvt.get('/fingerprint', handlers.randomFingerprint)
  pvt.get('/fingerprint/options', handlers.fingerprintVariants)

  pvt.get('/browsers', handlers.browsersList)
  pvt.get('/proxies', handlers.proxiesList)
  // pvt.get('/userdata', handlers.proxiesList)

  pvt.post('/browsers/create', handlers.createBrowser)
  pvt.post('/proxies/create', handlers.createProxy)

}
