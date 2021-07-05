import { expect } from 'chai'
import { createClient, blankId, invalidId, Rep } from './helper'

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
    let rep: Rep

    let doc = await api.fill.profile({ proxy: blankId() })
    expect(doc.proxy).to.be.null

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(1, 'blankId.profiles')

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(0, 'blankId.proxies')

    doc = await api.fill.profile({ proxy: invalidId() })
    expect(doc.proxy).to.be.null

    rep = await api.profiles.list()
    rep.expect(rep.data.profiles).to.have.lengthOf(2, 'invalidId.profiles')

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(0, 'invalidId.proxies')
  })

  it('should create profile with new proxy and save to proxies list', async function () {
    let rep: Rep

    const doc = await api.fill.profile({ proxy: PROXY })
    expect(doc.proxy).to.be.a('string')
    expect(doc).to.not.have.property('proxyCreate')

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(1)
    rep.expect(rep.data.proxies[0]._id).to.equal(doc.proxy)

    const profileId = doc._id
    rep = await api.profiles.save({ proxy: PROXY }, profileId)
    rep.expect(rep.data.profile._id).to.be.equal(profileId)
    rep.expect(rep.data.proxy).to.be.not.equal(doc.proxy)

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(2)

    rep = await api.profiles.save({ proxy: null }, profileId)
    rep.expect(rep.data.profile._id).to.be.equal(profileId)
    rep.expect(rep.data.profile.proxy).to.be.null
  })
})
