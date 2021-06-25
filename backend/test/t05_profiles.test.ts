import { expect } from 'chai'
import { createClient, blankId, invalidId } from './common'

describe('profiles', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should create profile', async function () {
    let rep = null

    rep = await api.profiles.list()
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true
    expect(rep.data.profiles).to.be.an('array')
    expect(rep.data.profiles).to.have.lengthOf(0)

    const fingerprint = await api.fill.fingerprint('mac')
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

    const profile = await api.fill.profile({ name: '1234', os: 'mac' })
    expect(profile).be.not.undefined
    expect(profile.name).to.be.equal('1234')
    expect(profile.fingerprint.os).to.be.equal('mac')

    rep = await api.profiles.list()
    expect(rep.data.profiles).to.have.lengthOf(1)

    const name = '4321'
    const profileId = profile._id
    const fingerprint = { os: 'win' as const }

    rep = await api.profiles.save({ name, fingerprint }, profileId)
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
    const profileId = (await api.fill.profile({}))._id

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

    const id1 = (await api.fill.profile({}))._id
    const id2 = (await api.fill.profile({}))._id

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

    rep = await api.profiles.delete({ ids: [blankId()] })
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true

    rep = await api.profiles.delete({ ids: [invalidId()] })
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true
  })
})
