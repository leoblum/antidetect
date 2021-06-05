/* eslint no-unused-expressions: "off" */

// eslint-disable-next-line import/order
const config = require('../src/config')
config.MONGODB_URI = 'mongodb://127.0.0.1:27017/yanus-test'

const expect = require('chai').expect

const buildApp = require('../src/app').build

const getClient = require('./client')

describe('backend app', function () {
  let [app, api] = [null, null]

  beforeEach(async function () {
    app = await buildApp()
    api = getClient(app)
    await app.db.dropDatabase()
  })

  afterEach(async function () {
    await app.close()
  })

  async function getFingerprint (os) {
    const { fingerprint } = (await api.fingerprint.get()).data
    fingerprint.os = os
    return fingerprint
  }

  async function fillUser () {
    const email = 'user@example.com'
    const password = '1234'

    await api.users.create(email, password)
    await api.users.confirmEmail(email)
    await api.users.auth(email, password, true)
  }

  async function fillProfile ({ name = '1234', os = 'mac' }) {
    const fingerprint = await getFingerprint(os)
    return (await api.profiles.save({ name, fingerprint })).data.profile
  }

  describe('tests setup', function () {
    it('should be initiated app & api vars', async function () {
      expect(app).not.to.be.null
      expect(api).not.to.be.null
    })

    it('should be connected to test dababase', async function () {
      const name = app.db.name
      expect(name.split('-').reverse()[0]).to.be.equal('test')
    })
  })

  describe('users registration', function () {
    const email = 'user@example.com'
    const password = '1234'

    it('should create user by email and password', async function () {
      let rep = null

      rep = await api.users.create(email, password)
      expect(rep.statusCode).to.equal(201)
      expect(rep.data.success).to.be.true

      rep = await api.users.checkEmailExists(email)
      expect(rep.data.success).to.be.true
      expect(rep.data.exists).to.be.true
    })

    it('should not create user on same email twice', async function () {
      let rep = null

      rep = await api.users.create(email, password)
      expect(rep.statusCode).to.equal(201)
      expect(rep.data.success).to.be.true

      rep = await api.users.create(email, password)
      expect(rep.statusCode).to.equal(412)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.equal('email_already_used')
    })

    it('should be error on wrong email format', async function () {
      let rep = null

      const wrongEmails = [12124124, true, null, { a: 1, b: 2 }, 'asfasfasfa']
      for (const email of wrongEmails) {
        rep = await api.users.create(email, password)
        expect(rep.statusCode).to.equal(400)
      }
    })
  })

  describe('users authentication', function () {
    const email = 'user@example.com'
    const password = '1234'

    beforeEach(async function () {
      await api.users.create(email, password)
    })

    it('should authenticate by email & password', async function () {
      let rep = null

      rep = await api.users.confirmEmail(email)
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.users.auth(email, password)
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data).to.have.property('token')
    })

    it('should not authenticate when email not confirmed', async function () {
      let rep = null

      rep = await api.users.auth(email, password)
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('email_not_confirmed')
    })

    it('should not authenticate with wrong password', async function () {
      let rep = null

      const wrongPassword = password + password
      rep = await api.users.auth(email, wrongPassword)
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('wrong_password')
    })

    it('should access to protected api after authentication', async function () {
      let rep = null

      rep = await api.users.confirmEmail(email)
      rep = await api.users.auth(email, password, true)

      rep = await api.users.checkAuth()
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true
    })

    it('should not access to protected api when not authenticated', async function () {
      let rep = null

      rep = await api.users.confirmEmail(email)
      rep = await api.users.checkAuth()
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('invalid_auth_header')
    })

    it('should not access to protected api with bad auth header', async function () {
      let rep = null

      rep = await api.users.confirmEmail(email)
      rep = await api.users.auth(email, password)

      const token = api.headers.Authorization.split(' ')[1].split('.').reverse()
      api.headers.Authorization = `Bearer ${token}` // modify token to bad one

      rep = await api.users.checkAuth()
      expect(rep.statusCode).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('invalid_auth_header')
    })
  })

  describe('fingerprints', function () {
    beforeEach(fillUser)

    it('should return random fingerprint for win & mac', async function () {
      let rep = null

      rep = await api.fingerprint.get()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.fingerprint).to.be.an('object')
      expect(rep.data.fingerprint.win).to.be.an('object')
      expect(rep.data.fingerprint.mac).to.be.an('object')
    })

    it('should return fingerprint options for generator', async function () {
      let rep = null

      rep = await api.fingerprint.variants()
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

  describe('profiles', function () {
    beforeEach(fillUser)

    it('should create profile', async function () {
      let rep = null

      rep = await api.profiles.list()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.profiles).to.be.an('array')
      expect(rep.data.profiles).to.have.lengthOf(0)

      const fingerprint = await getFingerprint('mac')
      rep = await api.profiles.save({ name: 'profile-mac', fingerprint })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.profile).to.be.an('object')

      expect(rep.data.profile).to.have.property('_id')
      expect(rep.data.profile).to.have.property('team')
      expect(rep.data.profile).to.have.property('name')
      expect(rep.data.profile).to.have.property('fingerprint')
      expect(rep.data.profile).to.have.property('proxy')
      expect(rep.data.profile).to.have.property('createdAt')
      expect(rep.data.profile).to.have.property('updatedAt')

      expect(rep.data.profile.name).to.equal('profile-mac')
      expect(rep.data.profile.fingerprint).to.deep.equal(fingerprint)
      expect(rep.data.profile.proxy).to.be.null

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(1)
    })

    // it('should not create profile without fingerprint', async function () {
    // expect(false).to.be.true
    // })

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

    //   let fingerprint = (await api.fingerprint.get()).data
    //   rep = await api.profiles.save({ name: 'profile-mac', fingerprint: fingerprint.mac })
    //   expect(rep.statusCode).to.equal(200)
    //   expect(rep.data.success).to.be.true
    //   expect(rep.data.profile).to.have.property('proxy')
    //   expect(rep.data.profile.proxy).to.be.an('string')

    //   console.log(rep.data.profile)
    // })

    it('should update by id', async function () {
      let rep = null

      const profile = await fillProfile({ name: '1234', os: 'mac' })
      expect(profile).be.not.undefined
      expect(profile.name).to.be.equal('1234')
      expect(profile.fingerprint.os).to.be.equal('mac')

      const name = '4321'
      const profileId = profile._id
      const fingerprint = { os: 'win' }

      rep = await api.profiles.save({ profileId, name, fingerprint })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.profile._id).to.be.equal(profileId)
      expect(rep.data.profile.name).to.be.equal(name)
      expect(rep.data.profile.fingerprint.os).to.be.equal('win')
      expect(rep.data.updatedAt).to.be.not.equal(profile.updatedAt)
    })

    it('should delete by id', async function () {
      let rep = null
      const profileId = (await fillProfile({}))._id

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(1)

      rep = await api.profiles.delete({ ids: [profileId] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.profiles.get(profileId)
      expect(rep.statusCode).to.equal(404)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('not_found')

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(0)
    })

    it('should delete by id (bulk)', async function () {
      let rep = null

      const id1 = (await fillProfile({}))._id
      const id2 = (await fillProfile({}))._id

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(2)

      rep = await api.profiles.delete({ ids: [id1, id2] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(0)
    })

    it('should delete with success=true on invalid id', async function () {
      let rep = null

      rep = await api.profiles.delete({ ids: ['1234'] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
    })
  })

  describe('proxies', function () {
    beforeEach(fillUser)

    const Proxy = { name: 'proxy-1', type: 'https', host: '127.0.0.1', port: 8080, username: 'user', password: 'pass' }

    it('should create proxy', async function () {
      let rep = null

      rep = await api.proxies.list()
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data.proxies).to.be.an('array')
      expect(rep.data.proxies).to.have.lengthOf(0)

      rep = await api.proxies.save(Proxy)
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data).to.have.property('proxy')
      expect(rep.data.proxy).to.be.an('object')

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(1)
    })

    it('should update by id', async function () {
      let rep = null

      rep = await api.proxies.save(Proxy)
      expect(rep.data.success).to.be.true

      const proxyId = rep.data.proxy._id
      const name = '1234'

      rep = await api.proxies.save({ proxyId, name })
      expect(rep.data.success).to.be.true
      expect(rep.data.proxy).to.be.an('object')
      expect(rep.data.proxy._id).to.equal(proxyId)
      expect(rep.data.proxy.name).to.equal(name)

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(1)
    })

    it('should delete by id', async function () {
      let rep = null

      const id1 = (await api.proxies.save(Proxy)).data.proxy._id

      rep = await api.proxies.delete({ ids: [id1] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.proxies.get(id1)
      expect(rep.statusCode).to.equal(404)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('not_found')

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(0)
    })

    it('should delete by id (bulk)', async function () {
      let rep = null

      const id1 = (await api.proxies.save(Proxy)).data.proxy._id
      const id2 = (await api.proxies.save(Proxy)).data.proxy._id
      // eslint-disable-next-line no-unused-vars
      const id3 = (await api.proxies.save(Proxy)).data.proxy._id

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(3)

      rep = await api.proxies.delete({ ids: [id1, id2] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(1)
    })

    it('should delete with success=true on invalid id', async function () {
      let rep = null

      rep = await api.proxies.delete({ ids: ['1234'] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
    })

    it('should get proxy by id', async function () {
      let rep = null
      const id1 = (await api.proxies.save(Proxy)).data.proxy._id

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(1)

      rep = await api.proxies.get(id1)
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
    })
  })
})
