import { expect } from 'chai'
import { createClient } from './helper'

describe('profiles actions', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should lock profile', async function () {
    const profileId = (await api.fill.profile({ proxy: null }))._id

    const rep = await api.profiles.lock(profileId)
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true
    expect(rep.data).to.have.property('profile')
    expect(rep.data.profile.activeUserId).to.be.not.null
    expect(rep.data.profile.activeStatus).to.be.true
  })

  it('should unlock profile', async function () {
    const profileId = (await api.fill.profile({ proxy: null }))._id

    let rep = await api.profiles.lock(profileId)
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true

    rep = await api.profiles.unlock(profileId)
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true
    expect(rep.data).to.have.property('profile')
    expect(rep.data.profile.activeUserId).to.be.null
    expect(rep.data.profile.activeStatus).to.be.false
  })
})
