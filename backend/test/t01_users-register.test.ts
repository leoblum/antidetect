import { createClient, Rep } from './helper'

describe('users registration', function () {
  const api = createClient()

  const email = 'user@example.com'
  const password = '123456'

  it('should create user by email and password', async function () {
    let rep: Rep

    rep = await api.users.create(email, password)
    rep.expect(rep.statusCode).to.equal(201)
    rep.expect(rep.data.success).to.be.true

    rep = await api.users.checkEmailExists(email)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data.exists).to.be.true
  })

  it('should not create user on same email twice', async function () {
    let rep: Rep

    rep = await api.users.create(email, password)
    rep.expect(rep.statusCode).to.equal(201)
    rep.expect(rep.data.success).to.be.true

    rep = await api.users.create(email, password)
    rep.expect(rep.statusCode).to.equal(400)
    rep.expect(rep.data.success).to.be.false
    rep.expect(rep.data.message).to.equal('email_already_used')
  })

  it('should be error on wrong email format', async function () {
    const wrongEmails = [12124124, true, null, { a: 1, b: 2 }, 'asfasfasfa']
    for (const email of wrongEmails) {
      // @ts-expect-error check wrong types
      let rep = await api.users.create(email, password)
      rep.expect(rep.statusCode).to.equal(400)
      // await expect(rep.data.success).to.be.false // todo:
    }
  })
})
