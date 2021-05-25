/* eslint no-unused-expressions: "off" */

const expect = require('chai').expect

const buildApp = require('../src/app').build
const config = require('../src/config')

const getClient = require('./client')

config.MONGODB_URI = 'mongodb://127.0.0.1:27017/yanus-test'

async function createUserAndSession () {
  const email = 'user@example.com'
  const password = '1234'

  const [api, rep] = [getClient(this), null]
  await api.createUser(email, password)
  await api.confirmEmail(email)
  await api.auth(email, password, true)
}

describe('backend tests', function () {
  beforeEach(async function () {
    this.app = await buildApp()
    this.api = getClient(this)
  })

  afterEach(async function () {
    await this.app.db.dropDatabase()
    await this.app.close()
    delete this.api
  })

  describe('check tests setup', function () {
    it('should exists this.app & this.api', async function () {
      expect(this).to.have.property('app')
      expect(this).to.have.property('api')

      expect(this.app).not.to.be.undefined
      expect(this.api).not.to.be.undefined
    })

    it('should connect to test db', async function () {
      const name = this.app.db.name
      expect(name.split('-').reverse()[0]).to.be.equal('test')
    })
  })

  describe('users creation', function () {
    const email = 'user@example.com'
    const password = '1234'

    it('should create user by email and password', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.createUser(email, password)
      expect(rep.statusCode).to.equal(201)
      expect(rep.data.success).to.be.true

      rep = await api.checkEmailExists(email)
      expect(rep.data.success).to.be.true
      expect(rep.data.exists).to.be.true
    })

    it('should not create user on same email twice', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.createUser(email, password)
      expect(rep.statusCode).to.equal(201)
      expect(rep.data.success).to.be.true

      rep = await api.createUser(email, password)
      expect(rep.statusCode).to.equal(412)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.equal('email_already_used')
    })

    it('should be error on wrong email format', async function () {
      let [api, rep] = [getClient(this), null]

      const wrongEmails = [12124124, true, null, { a: 1, b: 2 }, 'asfasfasfa']
      for (const email of wrongEmails) {
        rep = await api.createUser(email, password)
        expect(rep.statusCode).to.equal(400)
      }
    })
  })

  describe('users authentication', function () {
    const email = 'user@example.com'
    const password = '1234'

    beforeEach(async function () {
      const [api, rep] = [getClient(this), null]
      await api.createUser(email, password)
    })

    it('should authenticate by email & password', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.confirmEmail(email)
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.auth(email, password)
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data).to.have.property('token')
    })

    it('should not authenticate when email not confirmed', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.auth(email, password)
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('email_not_confirmed')
    })

    it('should not authenticate with wrong password', async function () {
      let [api, rep] = [getClient(this), null]

      const wrongPassword = password + password
      rep = await api.auth(email, wrongPassword)
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('wrong_password')
    })

    it('should access to protected api after authentication', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.confirmEmail(email)
      rep = await api.auth(email, password, true)

      rep = await api.protected()
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true
    })

    it('should not access to protected api when not authenticated', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.confirmEmail(email)
      rep = await api.protected()
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('invalid_auth_header')
    })

    it('should not access to protected api with bad auth header', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.confirmEmail(email)
      rep = await api.auth(email, password)

      const token = api.headers.Authorization.split(' ')[1].split('.').reverse()
      api.headers.Authorization = `Bearer ${token}` // modify token to bad one

      rep = await api.protected()
      expect(rep.statusCode).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('invalid_auth_header')
    })
  })

  describe('fingerprints api', function () {
    beforeEach(createUserAndSession.bind(this))

    it('should return random fingerprint for win & mac', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.getFingerprint()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.win).to.be.an('object')
      expect(rep.data.mac).to.be.an('object')
    })

    it('should return fingerprint options for generator', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.getFingerprintOptions()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      const fields = ['screen', 'cpu', 'ram', 'fonts', 'renderer', 'ua']
      for (const os of ['win', 'mac']) {
        expect(rep.data[os]).to.be.an('object')
        for (const field of fields) {
          expect(rep.data[os][field]).to.be.an('array')
        }
      }
    })
  })

  describe('proxies creation', function () {
    beforeEach(createUserAndSession.bind(this))

    it('should create proxy for current user and be in proxies list', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.proxiesList()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.proxies).to.be.an('array')
      expect(rep.data.proxies).to.have.lengthOf(0)

      rep = await api.createProxy({
        name: 'proxy-1',
        type: 'https',
        host: '127.0.0.1',
        port: 8080,
        username: 'user',
        password: 'pass',
      })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data).to.have.property('proxy')
      expect(rep.data.proxy).to.be.an('object')

      rep = await api.proxiesList()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.proxies).to.have.lengthOf(1)
    })
  })

  describe('profiles creation', function () {
    beforeEach(createUserAndSession.bind(this))

    it('should create profile for current user and be in profiles list', async function () {
      let [api, rep] = [getClient(this), null]

      rep = await api.profilesList()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.profiles).to.be.an('array')
      expect(rep.data.profiles).to.have.lengthOf(0)

      const fingerprint = (await api.getFingerprint()).data

      rep = await api.createProfile('profile-mac', fingerprint.mac, null)
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.profilesList()
      expect(rep.data.profiles).to.have.lengthOf(1)

      rep = await api.createProfile('profile-win', fingerprint.win, null)
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.profilesList()
      expect(rep.data.profiles).to.have.lengthOf(2)
    })

    it('should create profile without proxy', async function () {
      let [api, rep] = [getClient(this), null]

      const fingerprint = (await api.getFingerprint()).data
      rep = await api.createProfile('profile-mac', fingerprint.mac, null)
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.profile).to.have.property('proxy')
      expect(rep.data.profile.proxy).to.be.null
    })

    it('should not create profile without fingerprint', async function () {
      expect(false).to.be.true
    })

    // it('should create profile with new proxy', async () => {
    //   let [api, rep] = [getClient(this), null]

    //   let proxy = {
    //     name: 'proxy-1',
    //     type: 'socks5',
    //     host: 'localhost',
    //     port: 8080,
    //     username: 'user',
    //     password: 'pass',
    //   }

    //   let fingerprint = (await api.getFingerprint()).data
    //   rep = await api.createProfile('profile-mac', fingerprint.mac, proxy)
    //   expect(rep.statusCode).to.equal(200)
    //   expect(rep.data.success).to.be.true
    //   expect(rep.data.profile).to.have.property('proxy')
    //   expect(rep.data.profile.proxy).to.be.an('string')

    //   console.log(rep.data.profile)
    // })
  })
})
