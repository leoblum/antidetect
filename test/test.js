const expect = require('chai').expect

const config = require('../src/config')
const buildApp = require('../src/app').build
const createClient = require('./client')

config.MONGODB_URI = 'mongodb://127.0.0.1:27017/yanus-test'

beforeEach(async () => {
  this.app = await buildApp()
  this.api = createClient(this.app)
})

afterEach(async () => {
  await this.app.db.dropDatabase()
  await this.app.close()
})

describe('users creation', () => {
  const email = 'user@example.com'
  const password = '1234'

  it('should create user by email and password', async () => {
    let [api, rep] = [createClient(this.app), null]

    rep = await api.createUser(email, password)
    expect(rep.statusCode).to.equal(201)
    expect(rep.json().success).to.be.true

    rep = await api.checkEmailExists(email)
    expect(rep.json().success).to.be.true
    expect(rep.json().exists).to.be.true
  })

  it('should not create user on same email twice', async () => {
    let [api, rep] = [createClient(this.app), null]

    rep = await api.createUser(email, password)
    expect(rep.statusCode).to.equal(201)
    expect(rep.json().success).to.be.true

    rep = await api.createUser(email, password)
    expect(rep.statusCode).to.equal(412)
    expect(rep.json().success).to.be.false
    expect(rep.json().message).to.equal('email_already_used')
  })

  it('should be error on wrong email format', async () => {
    let [api, rep] = [createClient(this.app), null]

    let wrongEmails = [12124124, true, null, {a: 1, b: 2}, 'asfasfasfa']
    for (let email of wrongEmails) {
      rep = await api.createUser(email, password)
      expect(rep.statusCode).to.equal(400)
    }
  })
})

describe('users authentication', () => {
  const email = 'user@example.com'
  const password = '1234'

  beforeEach(async () => {
    let [api, rep] = [createClient(this.app), null]
    await api.createUser(email, password)
  })

  it('should authenticate by email & password', async () => {
    let [api, rep] = [createClient(this.app), null]

    rep = await api.confirmEmail(email)
    expect(rep.statusCode, rep.body).to.equal(200)
    expect(rep.json().success).to.be.true

    rep = await api.auth(email, password)
    expect(rep.statusCode, rep.body).to.equal(200)
    expect(rep.json().success).to.be.true
    expect(rep.json()).to.have.property('token')
  })

  it('should not authenticate with wrong password', async () => {
    let [api, rep] = [createClient(this.app), null]

    let wrongPassword = password + password
    rep = await api.auth(email, wrongPassword)
    expect(rep.statusCode, rep.body).to.equal(401)
    expect(rep.json().success).to.be.false
    expect(rep.json().message).to.be.equal('wrong_password')
  })

  it('should not authenticate when email not confirmed', async () => {
    let [api, rep] = [createClient(this.app), null]

    rep = await api.auth(email, password)
    expect(rep.statusCode, rep.body).to.equal(401)
    expect(rep.json().success).to.be.false
    expect(rep.json().message).to.be.equal('email_not_confirmed')
  })
})
