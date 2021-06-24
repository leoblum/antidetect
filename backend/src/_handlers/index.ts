import fp from 'fastify-plugin'

import fingerprint from './fingerprint'
import profiles from './profiles'
import proxies from './proxies'
import users from './users'

export default fp(async srv => {
  srv.register(users)
  srv.register(fingerprint)
  srv.register(proxies)
  srv.register(profiles)
})
