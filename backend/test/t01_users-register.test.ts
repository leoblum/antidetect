import { expect } from 'chai'
import { createClient } from './helper'

describe('users registration', function () {
  const api = createClient()

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
    const wrongEmails = [12124124, true, null, { a: 1, b: 2 }, 'asfasfasfa']
    for (const email of wrongEmails) {
      // @ts-expect-error test wrong email types
      await expect(api.users.create(email, password)).to.be.rejected
    }
  })
})
