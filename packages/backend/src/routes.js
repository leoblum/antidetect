const handlers = require('./handlers')
const schemas = require('./schemas')

module.exports = async function (fastify, opts) {
  const { pub, pvt } = fastify
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

  pvt.get('/profiles', handlers.profilesList)
  pvt.get('/profiles/:profileId', handlers.getProfile)
  pvt.pst('/profiles/save', handlers.saveProfile)
  pvt.pst('/profiles/delete', handlers.deleteProfiles)

  pvt.get('/proxies', handlers.proxiesList)
  // pvt.get('/userdata', handlers.proxiesList)
  pvt.post('/proxies/create', handlers.createProxy)
}
