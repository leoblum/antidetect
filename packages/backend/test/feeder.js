const client = require('./client')
const buildApp = require('../src/app').build
const getClient = require('./client')

const email = 'willow.bruen25@ethereal.email'
const password = email

async function main () {
  const app = await buildApp()
  const api = getClient({app})

  const rep = await api.auth(email, password, true)

  console.log(await app.db.dropCollection('browsers'))
  console.log(await app.db.dropCollection('proxies'))

  function randomChoice (arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  let proxy = {
    name: 'proxy-1',
    type: 'socks5',
    host: 'localhost',
    port: 8080,
    username: 'user',
    password: 'pass',
  }

  let users = ['willow.bruen25@ethereal.email', 'user@example.com']
  for (let user of users) {
    for (let i = 0; i < 5; ++i) {
      proxy.name = 'proxy-' + (i + 1)
      proxy.country = randomChoice(['ru', 'ua', 'pl', 'au'])

      let fingerprint = (await api.getFingerprint()).data
      let rep = await api.createBrowser('profile ' + (i + 1), fingerprint.mac, proxy)
      console.log(rep.statusCode)
    }
  }

  await app.close()
}

main()
