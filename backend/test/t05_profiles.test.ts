import { expect } from 'chai'
import { createClient, blankId, invalidId, Rep } from './helper'

describe('profiles', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should create profile', async function () {
    let rep: Rep

    rep = await api.profiles.list()
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data.profiles).to.be.an('array')
    rep.expect(rep.data.profiles).to.have.lengthOf(0)

    const fingerprint = await api.fill.fingerprint('mac')
    rep = await api.profiles.save({ name: 'profile-mac', fingerprint })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data.profile).to.be.an('object')

    rep.expect(rep.data.profile).to.have.property('_id')
    rep.expect(rep.data.profile).to.have.property('teamId')
    rep.expect(rep.data.profile).to.have.property('name')
    rep.expect(rep.data.profile).to.have.property('fingerprint')
    rep.expect(rep.data.profile).to.have.property('proxy')
    rep.expect(rep.data.profile).to.have.property('createdAt')
    rep.expect(rep.data.profile).to.have.property('updatedAt')

    rep.expect(rep.data.profile.name).to.equal('profile-mac')
    rep.expect(rep.data.profile.fingerprint).to.deep.equal(fingerprint)
    rep.expect(rep.data.profile.proxy).to.be.null

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(1)
  })

  // it('should not create profile without fingerprint', async function () {
  // expect(false).to.be.true
  // })

  it('should update by id', async function () {
    let rep: Rep

    const profile = await api.fill.profile({ name: '1234', os: 'mac' })
    expect(profile).be.not.undefined
    expect(profile.name).to.be.equal('1234')
    expect(profile.fingerprint.os).to.be.equal('mac')

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(1)

    const name = '4321'
    const profileId = profile._id
    const fingerprint = { os: 'win' as const }

    rep = await api.profiles.save({ name, fingerprint }, profileId)
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data.profile._id).to.be.equal(profileId)
    rep.expect(rep.data.profile.name).to.be.equal(name)
    rep.expect(rep.data.profile.fingerprint.os).to.be.equal('win')
    rep.expect(rep.data.updatedAt).to.be.not.equal(profile.updatedAt)

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(1)
  })

  it('should delete by id', async function () {
    let rep: Rep
    const profileId = (await api.fill.profile({}))._id

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(1)

    rep = await api.profiles.delete({ ids: [profileId] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    rep = await api.profiles.get(profileId)
    rep.expect(rep.statusCode).to.equal(404)
    rep.expect(rep.data.success).to.be.false
    rep.expect(rep.data.message).to.be.equal('not_found')

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(0)
  })

  it('should delete by id (bulk)', async function () {
    let rep: Rep

    const id1 = (await api.fill.profile({}))._id
    const id2 = (await api.fill.profile({}))._id

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(2)

    rep = await api.profiles.delete({ ids: [id1, id2] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(0)
  })

  it('should delete with success=true on invalid id', async function () {
    let rep: Rep

    rep = await api.profiles.delete({ ids: [blankId()] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    rep = await api.profiles.delete({ ids: [invalidId()] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
  })
})
