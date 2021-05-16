const config = require('./config')
const mailer = require('./mailer')

async function build () {
  const fastify = require('fastify')({
    logger: {level: 'error', prettyPrint: true},
  })

  fastify.register(require('fastify-cors'), {})
  fastify.register(require('fastify-jwt'), {
    secret: config.JWT_SECRET,
  })

  fastify.register(require('./plugins/db'))
  fastify.register(require('./plugins/decorators'))

  fastify.register(require('./routes'))

  await mailer.init()
  return fastify.ready()
}

async function start () {
  const port = process.env.PORT || 3030

  const app = await build()
  await app.listen(port)
  console.log(`Server started at port ${port}`)
}

module.exports = {build, start}
