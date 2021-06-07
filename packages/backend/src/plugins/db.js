const fp = require('fastify-plugin')
const mongoose = require('mongoose')

const config = require('./../config')

module.exports = fp(async function (fastify, opts) {
  const instance = await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    serverSelectionTimeoutMS: 3000,
    // returnOriginal: false,
  })

  fastify.decorate('db', instance.connection)
  fastify.decorate('mongoose', instance)

  fastify.addHook('onClose', async () => await instance.disconnect())
})
