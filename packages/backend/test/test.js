/* eslint no-unused-expressions: "off" */

const expect = require('chai').expect

const buildApp = require('../src/app').build
const config = require('../src/config')

const getClient = require('./client')

config.MONGODB_URI = 'mongodb://127.0.0.1:27017/yanus-test'

describe('backend tests', function () {
  let app = null
  let api = null

  beforeEach(async function () {
    app = await buildApp()
    api = getClient(app)
  })

  afterEach(async function () {
    await app.db.dropDatabase()
    await app.close()
    app = null
    api = null
  })

  describe('check tests setup', function () {
    it('should exists this.app & this.api', async function () {
      expect(app).not.to.be.null
      expect(api).not.to.be.null
    })

    it('should connect to test db', async function () {
      const name = app.db.name
      expect(name.split('-').reverse()[0]).to.be.equal('test')
    })
  })

  describe('users creation', function () {
    const email = 'user@example.com'
    const password = '1234'

    it('should create user by email and password', async function () {
      let rep = null

      rep = await api.createUser(email, password)
      expect(rep.statusCode).to.equal(201)
      expect(rep.data.success).to.be.true

      rep = await api.checkEmailExists(email)
      expect(rep.data.success).to.be.true
      expect(rep.data.exists).to.be.true
    })

    it('should not create user on same email twice', async function () {
      let rep = null

      rep = await api.createUser(email, password)
      expect(rep.statusCode).to.equal(201)
      expect(rep.data.success).to.be.true

      rep = await api.createUser(email, password)
      expect(rep.statusCode).to.equal(412)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.equal('email_already_used')
    })

    it('should be error on wrong email format', async function () {
      let rep = null

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
      await api.createUser(email, password)
    })

    it('should authenticate by email & password', async function () {
      let rep = null

      rep = await api.confirmEmail(email)
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true

      rep = await api.auth(email, password)
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true
      expect(rep.data).to.have.property('token')
    })

    it('should not authenticate when email not confirmed', async function () {
      let rep = null

      rep = await api.auth(email, password)
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('email_not_confirmed')
    })

    it('should not authenticate with wrong password', async function () {
      let rep = null

      const wrongPassword = password + password
      rep = await api.auth(email, wrongPassword)
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('wrong_password')
    })

    it('should access to protected api after authentication', async function () {
      let rep = null

      rep = await api.confirmEmail(email)
      rep = await api.auth(email, password, true)

      rep = await api.protected()
      expect(rep.statusCode, rep.body).to.equal(200)
      expect(rep.data.success).to.be.true
    })

    it('should not access to protected api when not authenticated', async function () {
      let rep = null

      rep = await api.confirmEmail(email)
      rep = await api.protected()
      expect(rep.statusCode, rep.body).to.equal(401)
      expect(rep.data.success).to.be.false
      expect(rep.data.message).to.be.equal('invalid_auth_header')
    })

    it('should not access to protected api with bad auth header', async function () {
      let rep = null

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

  describe('protected api', function () {
    beforeEach(async function () {
      const email = 'user@example.com'
      const password = '1234'

      await api.createUser(email, password)
      await api.confirmEmail(email)
      await api.auth(email, password, true)
    })

    describe('fingerprints api', function () {
      it('should return random fingerprint for win & mac', async function () {
        let rep = null

        rep = await api.getFingerprint()
        expect(rep.statusCode).to.equal(200)
        expect(rep.data.success).to.be.true
        expect(rep.data.win).to.be.an('object')
        expect(rep.data.mac).to.be.an('object')
      })

      it('should return fingerprint options for generator', async function () {
        let rep = null

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
      it('should create proxy for current user and be in proxies list', async function () {
        let rep = null

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

    describe('profiles', function () {
      it('should create profile for current user and be in profiles list', async function () {
        let rep = null

        rep = await api.profilesList()
        expect(rep.statusCode).to.equal(200)
        expect(rep.data.success).to.be.true
        expect(rep.data.profiles).to.be.an('array')
        expect(rep.data.profiles).to.have.lengthOf(0)

        const fingerprint = (await api.getFingerprint()).data

        rep = await api.saveProfile({ name: 'profile-mac', fingerprint: fingerprint.mac })
        expect(rep.statusCode).to.equal(200)
        expect(rep.data.success).to.be.true

        rep = await api.profilesList()
        expect(rep.data.profiles).to.have.lengthOf(1)

        rep = await api.saveProfile({ name: 'profile-win', fingerprint: fingerprint.win })
        expect(rep.statusCode).to.equal(200)
        expect(rep.data.success).to.be.true

        rep = await api.profilesList()
        expect(rep.data.profiles).to.have.lengthOf(2)
      })

      it('should create profile without proxy', async function () {
        let rep = null

        const fingerprint = (await api.getFingerprint()).data
        rep = await api.saveProfile({ name: 'profile-mac', fingerprint: fingerprint.mac })
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
      //   rep = await api.saveProfile({ name: 'profile-mac', fingerprint: fingerprint.mac })
      //   expect(rep.statusCode).to.equal(200)
      //   expect(rep.data.success).to.be.true
      //   expect(rep.data.profile).to.have.property('proxy')
      //   expect(rep.data.profile.proxy).to.be.an('string')

      //   console.log(rep.data.profile)
      // })

      it('should update profile by profileId', async function () {
        let rep = null

        const fingerprint = (await api.getFingerprint()).data
        const profile = (await api.saveProfile({ name: '1234', fingerprint: fingerprint.mac })).data.profile
        expect(profile).be.not.undefined
        expect(profile.name).to.be.equal('1234')

        rep = await api.saveProfile({ name: '4321', _id: profile._id, fingerprint: { os: 'win' } })
        expect(rep.statusCode).to.equal(200)
        expect(rep.data.success).to.be.true
        expect(rep.data.profile._id).to.be.equal(profile._id)
        expect(rep.data.profile.name).to.be.equal('4321')
        expect(rep.data.profile.fingerprint.os).to.be.equal('win')
      })
    })
  })
})
