const client = require('./client')

const buildApp = require('../src/app').build

const getClient = require('./client')

const email = 'willow.bruen25@ethereal.email'
const password = email

async function main () {
  const app = await buildApp()
  const api = getClient({ app })

  console.log(await app.db.dropCollection('profiles'))
  console.log(await app.db.dropCollection('proxies'))

  function randomChoice (arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const proxy = {
    name: 'proxy-1',
    type: 'socks5',
    host: 'localhost',
    port: 8080,
    username: 'user',
    password: 'pass',
  }

  const users = ['willow.bruen25@ethereal.email', 'user@example.com']
  for (const user of users) {
    for (let i = 0; i < 5; ++i) {
      proxy.name = 'proxy-' + (i + 1)
      proxy.country = randomChoice(['ru', 'ua', 'pl', 'au'])

      const fingerprint = (await api.getFingerprint()).data
      const rep = await api.createProfile('profile ' + (i + 1), fingerprint.mac, proxy)
      console.log(rep.statusCode)
    }
  }

  await app.close()
}

main()
