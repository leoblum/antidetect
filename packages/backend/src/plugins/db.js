const fp = require('fastify-plugin')
const mongoose = require('mongoose')

const config = require('./../config')

module.exports = fp(async function (fastify, opts) {
  const instance = await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    serverSelectionTimeoutMS: 3000,
  })

  fastify.decorate('db', instance.connection)

  fastify.addHook('onClose', async () => {
    await instance.connection.close()
  })
})
