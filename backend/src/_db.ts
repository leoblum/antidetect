import fp from 'fastify-plugin'
import mongoose from 'mongoose'

import config from './config'

declare module 'fastify' {
  interface FastifyInstance {
    db: any
  }
}

export default fp(async srv => {
  const instance = await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    serverSelectionTimeoutMS: 3000,
    // returnOriginal: false,
  })

  srv.decorate('db', instance.connection)
  srv.decorate('mongoose', instance)
  srv.addHook('onClose', async () => await instance.disconnect())
})
