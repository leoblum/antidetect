import { expect } from 'chai'
import { createClient, blankId, invalidId } from './common'

const PROXY = { name: '1234', type: 'http' as const, host: 'localhost', port: 8080, username: '', password: '' }

describe('profiles & proxies', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should create profile with proxy by id', async function () {
    const proxy = await api.fill.proxy({ username: 'user', password: 'pass' })
    const profile = await api.fill.profile({ proxy: proxy._id })
    expect(profile.proxy).to.equal(proxy._id)
  })

  it('should create profile with invalid proxyId', async function () {
    let rep = null

    rep = await api.fill.profile({ proxy: blankId() })
    expect(rep.proxy).to.be.null
    rep = await api.profiles.list()
    expect(rep.data.profiles).to.have.lengthOf(1, 'blankId.profiles')
    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(0, 'blankId.proxies')

    rep = await api.fill.profile({ proxy: invalidId() })
    expect(rep.proxy).to.be.null
    rep = await api.profiles.list()
    expect(rep.data.profiles).to.have.lengthOf(2, 'invalidId.profiles')
    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(0, 'invalidId.proxies')
  })

  it('should create profile with new proxy and save to proxies list', async function () {
    let rep = null

    const profile = await api.fill.profile({ proxyCreate: PROXY })
    expect(profile.proxy).to.be.a('string')
    expect(profile).to.not.have.property('proxyCreate')

    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(1)
    expect(rep.data.proxies[0]._id).to.equal(profile.proxy)

    const profileId = profile._id
    rep = await api.profiles.save({ _id: profileId, proxyCreate: PROXY })
    expect(rep.data.profile._id).to.be.equal(profileId)
    expect(rep.data.proxy).to.be.not.equal(profile.proxy)

    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(2)

    rep = await api.profiles.save({ _id: profileId, proxy: null })
    expect(rep.data.profile._id).to.be.equal(profileId)
    expect(rep.data.profile.proxy).to.be.null
  })
})
