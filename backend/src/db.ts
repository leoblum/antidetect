import fp from 'fastify-plugin'
import mongoose from 'mongoose'

declare module 'fastify' {
  interface FastifyInstance {
    db: any
  }
}

type Options = { uri: string }
export default fp<Options>(async (srv, opts) => {
  const instance = await mongoose.connect(opts.uri, {
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
