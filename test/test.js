const expect = require('chai').expect
const App = require('../src/app')
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/yanus-test'

function getApiClient (app) {
  return {
    async usersCheckEmail (email) {
      return await app.inject({
        method: 'post',
        url: '/users/checkEmail',
        payload: {email},
      })
    },
    async usersRegistration (email, password) {
      return await app.inject({
        method: 'post',
        url: '/users/register',
        payload: {email, password},
      })
    },
    async usersAuth (email, password) {
      return await app.inject({
        method: 'post',
        url: '/users/auth',
        payload: {email, password},
      })
    },
  }
}

beforeEach(async () => {
  this.app = await App.build()
  this.api = getApiClient(this.app)
})

afterEach(async () => {
  await this.app.db.dropDatabase()
  await this.app.close()
})

describe('users registration', () => {
  const email = 'user@example.com'
  const password = '1234'

  it('should register a new user by email and password', async () => {
    let rep = await this.api.usersRegistration(email, password)
    expect(rep.statusCode).to.equal(201)
    expect(rep.json().success).to.be.true

    rep = await this.api.usersCheckEmail(email)
    expect(rep.json().success).to.be.true
    expect(rep.json().exists).to.be.true
  })

  it('should not register on same email twice', async () => {
    let rep = await this.api.usersRegistration(email, password)
    expect(rep.statusCode).to.equal(201)
    expect(rep.json().success).to.be.true

    rep = await this.api.usersRegistration(email, password)
    expect(rep.statusCode).to.equal(412)
    expect(rep.json().success).to.be.false
    expect(rep.json().message).to.equal('email_already_used')
  })

  it('should be bad_request on invalid email format', async () => {
    const wrongEmails = [
      12124124, true, null, {a: 1, b: 2}, 'asfasfasfa',
    ]

    for (let email of wrongEmails) {
      let rep = await this.api.usersRegistration(email, password)
      expect(rep.statusCode).to.equal(400)
    }
  })
})

describe('api /users/auth', () => {
  const email = 'user@example.com'
  const password = '1234'

  beforeEach(async () => {
    await this.api.usersRegistration(email, password)
  })

  it('should authenticate user and create session', async () => {
    let rep = await this.api.usersAuth(email, password)

    expect(rep.statusCode).to.equal(200)
    expect(rep.json().success).to.be.true
    expect(rep.json()).to.have.property('token')
  })
})
