/* eslint-disable import/order */
/* eslint no-unused-expressions: "off" */

describe('backend app', function () {
  const [app, api] = [null, null]

  before(async function () {
    config.MONGODB_URI = await mongod.getUri('yanus-test')
  })

  afterEach(async function () {
    await app.close()
  })

  const Proxy = { name: 'proxy-123', type: 'http', host: '127.0.0.1', port: 8080, username: 'user', password: 'pass' }

  async function fillProfile ({ name = '1234', os = 'mac', proxy, proxyCreate }) {
    const fingerprint = await getFingerprint(os)
    return (await api.profiles.save({ name, fingerprint, proxy, proxyCreate })).data.profile
  }
})
