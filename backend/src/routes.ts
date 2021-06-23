
export default 12

// const { users, fingerprint, profiles, proxies } = require('./handlers')
// const schemas = require('./schemas')

// const pubRoutes = (pub) => {
// pub.pst('/users/create', users.create, schemas.UserCreateSchema)
// pub.pst('/users/login', users.login, schemas.UserAuthSchema)
// pub.pst('/users/checkEmail', users.checkEmail)
// pub.pst('/users/confirmEmail', users.confirmEmail)
// pub.pst('/users/resetPassword', users.resetPassword)
// }

// const pvtRoutes = (pvt) => {
// pvt.get('/users/checkToken', users.checkToken)
//
// pvt.get('/fingerprint', fingerprint.get)
// pvt.get('/fingerprint/options', fingerprint.variants)
//
// pvt.get('/profiles', profiles.list)
// pvt.get('/profiles/:profileId', profiles.get)
// pvt.pst('/profiles/save', profiles.save)
// pvt.pst('/profiles/delete', profiles.remove)
//
// pvt.get('/proxies', proxies.list)
// pvt.get('/proxies/:proxyId', proxies.get)
// pvt.pst('/proxies/save', proxies.save)
// pvt.pst('/proxies/delete', proxies.remove)
// }

// module.exports = async function (fastify, opts) {
// pubRoutes(fastify.pub)
// pvtRoutes(fastify.pvt)
// }
