import fp from 'fastify-plugin'

import * as h from './handlers'

export default fp(async (srv) => {
  const { get, post } = srv.Router

  // Public
  post('/users/create', h.usersCreate)
  post('/users/login', h.usersAuth)
  post('/users/checkEmail', h.usersCheckEmail)
  post('/users/confirmEmail', h.usersConfirmEmail)
  post('/users/resetPassword', h.usersResetPassword)

  // Protected
  get('/users/checkToken', h.usersCheckToken)

  get('/fingerprint', h.fingerprintGet)
  get('/fingerprint/options', h.fingerprintOptions)

  get('/proxies', h.proxyGetAll)
  get('/proxies/:proxyId', h.proxyGet)
  post('/proxies/save', h.proxyUpdate)
  post('/proxies/delete', h.proxyDelete)

  get('/profiles', h.profileGetAll)
  get('/profiles/:profileId', h.profileGet)
  post('/profiles/save', h.profileUpdate)
  post('/profiles/delete', h.profileDelete)
})
