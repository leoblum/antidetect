const config = require('./config')

async function build () {
  const fastify = require('fastify')({
    logger: {level: 'error', prettyPrint: true},
  })

  fastify.register(require('fastify-jwt'), {
    secret: config.JWT_SECRET,
  })

  fastify.register(require('./plugins/db'))
  fastify.register(require('./plugins/decorators'))

  fastify.register(require('./routes'))

  return fastify.ready()
}

async function start () {
  const port = process.env.PORT || 3030

  const app = await build()
  await app.listen(port)
  console.log(`Server started at port ${port}`)
}

module.exports = {build, start}
