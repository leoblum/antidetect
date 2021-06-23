const expect = require('chai').expect

describe('profiles & proxies', function () {
  beforeEach(fillUser)

  it('should create profile with proxyId', async funwction () {
    const proxy = await fillProxy({ username: 'user', password: 'pass' })
    const profile = await fillProfile({ proxy: proxy._id })
    expect(profile.proxy).to.equal(proxy._id)
  })

  it('should create profile with invalid proxyId', async function () {
    let rep = null

    rep = await fillProfile({ proxy: blankId() })
    expect(rep.proxy).to.be.null
    rep = await api.profiles.list()
    expect(rep.data.profiles).to.have.lengthOf(1, 'blankId.profiles')
    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(0, 'blankId.proxies')

    rep = await fillProfile({ proxy: invalidId() })
    expect(rep.proxy).to.be.null
    rep = await api.profiles.list()
    expect(rep.data.profiles).to.have.lengthOf(2, 'invalidId.profiles')
    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(0, 'invalidId.proxies')
  })

  it('should create profile with new proxy and save to proxies list', async function () {
    let rep = null

    const proxyCreate = { ...Proxy }
    const profile = await fillProfile({ proxyCreate })
    expect(profile.proxy).to.be.a('string')
    expect(profile).to.not.have.property('proxyCreate')

    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(1)
    expect(rep.data.proxies[0]._id).to.equal(profile.proxy)

    const profileId = profile._id
    rep = await api.profiles.save({ profileId, proxyCreate })
    expect(rep.data.profile._id).to.be.equal(profileId)
    expect(rep.data.proxy).to.be.not.equal(profile.proxy)

    rep = await api.proxies.list()
    expect(rep.data.proxies).to.have.lengthOf(2)

    rep = await api.profiles.save({ profileId, proxy: null })
    expect(rep.data.profile._id).to.be.equal(profileId)
    expect(rep.data.profile.proxy).to.be.null
  })
})
