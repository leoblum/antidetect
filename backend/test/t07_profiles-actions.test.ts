import { createClient } from './helper'

describe('profiles actions', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should lock profile', async function () {
    const profileId = (await api.fill.profile({ proxy: null }))._id

    const rep = await api.profiles.lock(profileId)
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data).to.have.property('profile')
    rep.expect(rep.data.profile.activeUserId).to.be.not.null
    rep.expect(rep.data.profile.activeStatus).to.be.true
  })

  it('should unlock profile', async function () {
    const profileId = (await api.fill.profile({ proxy: null }))._id

    let rep = await api.profiles.lock(profileId)
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    rep = await api.profiles.unlock(profileId)
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data).to.have.property('profile')
    rep.expect(rep.data.profile.activeUserId).to.be.null
    rep.expect(rep.data.profile.activeStatus).to.be.false
  })
})
