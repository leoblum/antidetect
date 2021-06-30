import { expect } from 'chai'
import { createClient } from './common'

describe('profiles & proxies', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should create profile with proxy by id', async function () {
    const proxy = await api.fill.proxy({ username: 'user', password: 'pass' })
    const profile = await api.fill.profile({ proxy: proxy._id })
    expect(profile.proxy).to.equal(proxy._id)
  })
})
