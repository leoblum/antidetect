/* eslint no-unused-expressions: "off" */

// eslint-disable-next-line import/order
const config = require('../src/config')
config.MONGODB_URI = 'mongodb://127.0.0.1:27017/yanus-test'

const expect = require('chai').expect
const { ObjectId } = require('mongoose').Types

const buildApp = require('../src/app').build

function fill (length, value = null) {
  return new Array(length).fill(value)
}

function createClient (app) {
  const DefaultHeaders = {}

  const request = async ({ method, url, ...opts }) => {
    const headers = { ...DefaultHeaders, ...opts.headers }
    const rep = await app.inject({ ...opts, method, url, headers })
    Object.defineProperty(rep, 'data', { get: () => rep.json() })
    return rep
  }
  const get = async (url, opts = {}) => await request({ method: 'get', url, ...opts })
  const post = async (url, payload, opts = {}) => await request({ method: 'post', url, payload, ...opts })

  const users = {
    checkEmailExists: async (email) => await post('/users/checkEmail', { email }),
    create: async (email, password) => await post('/users/create', { email, password }),
    confirmEmail: async (email) => await post('/users/confirmEmail', { email }),
    auth: async (email, password) => {
      const rep = await post('/users/login', { email, password })
      if (rep.data.success) DefaultHeaders.Authorization = `Bearer ${rep.data.token}`
      return rep
    },
    checkAuth: async () => await get('/users/checkToken'),
  }

  const fingerprint = {
    get: async () => await get('/fingerprint'),
    variants: async () => await get('/fingerprint/options'),
  }

  const profiles = {
    list: async () => await get('/profiles'),
    get: async (profileId) => await get(`/profiles/${profileId}`),
    save: async ({ profileId, name, fingerprint, proxy = null, proxyCreate = null }) => (
      await post('/profiles/save', { _id: profileId, name, fingerprint, proxy, proxyCreate })
    ),
    delete: async ({ ids = [] }) => await post('/profiles/delete', { ids }),
  }

  const proxies = {
    list: async () => await get('/proxies'),
    get: async (proxyId) => await get(`/proxies/${proxyId}`),
    save: async ({ proxyId, name, type, host, port, username, password }) => (
      await post('/proxies/save', { _id: proxyId, name, type, host, port, username, password })
    ),
    delete: async ({ ids = [] }) => await post('/proxies/delete', { ids }),
  }

  const headers = DefaultHeaders
  return { headers, request, get, post, users, fingerprint, profiles, proxies }
}

describe('backend app', function () {
  let [app, api] = [null, null]

  beforeEach(async function () {
    console.log('~', new Date())
    app = await buildApp()
    api = createClient(app)
    await app.db.dropDatabase()
  })

  afterEach(async function () {
    await app.close()
  })

  const Proxy = { name: 'proxy-123', type: 'http', host: '127.0.0.1', port: 8080, username: 'user', password: 'pass' }

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

  async function fillProfile ({ name = '1234', os = 'mac', proxy, proxyCreate }) {
    const fingerprint = await getFingerprint(os)
    return (await api.profiles.save({ name, fingerprint, proxy, proxyCreate })).data.profile
  }

  async function fillProxy ({ name = '1234', type = 'http', host = 'localhost', port = 8080, username, password }) {
    const rep = await api.proxies.save({ name, type, host, port, username, password })
    return rep.data.proxy
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

    it('should update by id', async function () {
      let rep = null

      const profile = await fillProfile({ name: '1234', os: 'mac' })
      expect(profile).be.not.undefined
      expect(profile.name).to.be.equal('1234')
      expect(profile.fingerprint.os).to.be.equal('mac')

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(1)

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

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(1)
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

      expect(rep.data.proxy._id).to.be.a('string')
      expect(rep.data.proxy.team).to.be.a('string')
      expect(rep.data.proxy.name).to.equal('proxy-123')
      expect(rep.data.proxy.type).to.equal('http')
      expect(rep.data.proxy.port).to.equal(8080)
      expect(rep.data.proxy.username).to.equal('user')
      expect(rep.data.proxy.password).to.equal('pass')
      expect(rep.data.proxy.country).to.be.null

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(1)
    })

    it('should create proxy without login & password', async function () {
      let rep = null

      const ProxyWithoutCredencials = Object.assign({}, Proxy)
      delete ProxyWithoutCredencials.username
      delete ProxyWithoutCredencials.password

      rep = await api.proxies.save(ProxyWithoutCredencials)
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data).to.have.property('proxy')
      expect(rep.data.proxy).to.be.an('object')
      expect(rep.data.proxy.username).to.be.null
      expect(rep.data.proxy.password).to.be.null
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
      const id1 = (await fillProxy({ name: '101' }))._id
      const id2 = (await fillProxy({ name: '102' }))._id
      const id3 = (await fillProxy({ name: '103' }))._id

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(3)

      rep = await api.proxies.delete({ ids: [id1, id2] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      console.log(id1, id2, id3)
      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(1)
      expect(rep.data.proxies[0]._id).to.equal(id3)
      console.log(rep.data.proxies.map(x => x._id))
    })

    it('should delete with success=true on invalid id', async function () {
      let rep = null

      rep = await api.proxies.delete({ ids: ['123456789012'] })
      expect(rep.statusCode).to.equal(200)
      expect(rep.data.success).to.be.true

      // rep = await api.proxies.delete({ ids: ['1234'] })
      // expect(rep.statusCode).to.equal(500)
    })

    it('should delete by id from many', async function () {
      let rep = null
      const ids = (await Promise.all(fill(10).map(name => fillProxy({ name })))).map(x => x._id)

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.length(10)
      expect(rep.data.proxies.map(x => x._id)).to.have.all.members(ids)

      const toDelete = ids.pop()
      expect(ids).to.have.length(9)
      expect(ids).to.not.include(toDelete)
      rep = await api.proxies.delete({ ids: [toDelete] })

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.length(9)
      expect(rep.data.proxies.map(x => x._id)).to.not.include(toDelete)
      expect(rep.data.proxies.map(x => x._id)).to.have.all.members(ids)
    })
  })

  describe('profiles & proxies', function () {
    beforeEach(fillUser)

    it('should create profile with proxyId', async function () {
      const proxy = await fillProxy({ username: 'user', password: 'pass' })
      const profile = await fillProfile({ proxy: proxy._id })
      expect(profile.proxy).to.equal(proxy._id)
    })

    it('should create profile with invalid proxyId', async function () {
      let rep = null
      const invalidId = ObjectId().toString()

      const profile = await fillProfile({ proxy: invalidId })
      expect(profile.proxy).to.be.null // todo:

      rep = await api.profiles.list()
      expect(rep.data.profiles).to.have.lengthOf(1)

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(0)
    })

    it('should create profile with new proxy and save to proxies list', async function () {
      let rep = null

      const proxyCreate = { ...Proxy }
      const profile = await fillProfile({ proxyCreate })
      expect(profile.proxy).to.be.a('string')
      expect(profile).to.not.have.property('proxyCreate')

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(1)
      expect(rep.data.proxies[0]._id).to.equal(profile.proxy)

      const profileId = profile._id
      rep = await api.profiles.save({ profileId, proxyCreate })
      expect(rep.data.profile._id).to.be.equal(profileId)
      expect(rep.data.proxy).to.be.not.equal(profile.proxy)

      rep = await api.proxies.list()
      expect(rep.data.proxies).to.have.lengthOf(2)

      rep = await api.profiles.save({ profileId, proxy: null })
      expect(rep.data.profile._id).to.be.equal(profileId)
      expect(rep.data.profile.proxy).to.be.null
    })
  })
})
