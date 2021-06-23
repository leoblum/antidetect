import { expect } from 'chai'
import { createClient } from './common'

describe('users authentication', function () {
  const api = createClient()

  const email = 'user@example.com'
  const password = '1234'

  it('should authenticate by email & password', async function () {
    let rep = null
    await api.users.create(email, password)

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
    await api.users.create(email, password)

    rep = await api.users.auth(email, password)
    expect(rep.statusCode, rep.body).to.equal(401)
    expect(rep.data.success).to.be.false
    expect(rep.data.message).to.be.equal('email_not_confirmed')
  })

  it('should not authenticate with wrong password', async function () {
    let rep = null
    await api.users.create(email, password)
    await api.users.confirmEmail(email)

    const wrongPassword = password + password
    rep = await api.users.auth(email, wrongPassword)
    expect(rep.statusCode, rep.body).to.equal(401)
    expect(rep.data.success).to.be.false
    expect(rep.data.message).to.be.equal('wrong_password')
  })

  it('should access to protected api after authentication', async function () {
    let rep = null
    await api.users.create(email, password)
    await api.users.confirmEmail(email)
    await api.users.auth(email, password)

    rep = await api.users.checkAuth()
    expect(rep.statusCode, rep.body).to.equal(200)
    expect(rep.data.success).to.be.true
  })

  it('should not access to protected api when not authenticated', async function () {
    let rep = null
    await api.users.create(email, password)
    await api.users.confirmEmail(email)

    rep = await api.users.checkAuth()
    expect(rep.statusCode, rep.body).to.equal(401)
    expect(rep.data.success).to.be.false
    expect(rep.data.message).to.be.equal('invalid_auth_header')
  })

  it('should not access to protected api with bad auth header', async function () {
    let rep = null
    await api.users.create(email, password)
    await api.users.confirmEmail(email)
    await api.users.auth(email, password)

    // modify token to bad one
    const token = api.headers.Authorization.split(' ')[1].split('.').reverse()
    api.headers.Authorization = `Bearer ${token}`

    rep = await api.users.checkAuth()
    expect(rep.statusCode).to.equal(401)
    expect(rep.data.success).to.be.false
    expect(rep.data.message).to.be.equal('invalid_auth_header')
  })
})
