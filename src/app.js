const config = require('./config')

async function build () {
  const fastify = require('fastify')({
    logger: {level: 'error', prettyPrint: true},
  })

  fastify.decorateRequest('fastify', fastify)

  fastify.register(require('fastify-jwt'), {
    secret: config.JWT_SECRET,
  })

  fastify.register(require('./plugins/db'))
  fastify.register(require('./routes'))

  await fastify.ready()
  return fastify
}

async function start () {
  const port = process.env.PORT || 3030

  const app = await build()
  await app.listen(port)
  console.log(`Server started at port ${port}`)
}

module.exports = {build, start}
