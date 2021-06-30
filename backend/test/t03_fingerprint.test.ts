import { expect } from 'chai'
import { createClient } from './helper'

describe('fingerprints', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should return random fingerprint for win & mac', async function () {
    let rep = null

    rep = await api.fingerprint.get()
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true
    expect(rep.data.fingerprint).to.be.an('object')
    expect(rep.data.fingerprint.win).to.be.an('object')
    expect(rep.data.fingerprint.mac).to.be.an('object')
  })

  it('should return fingerprint options for generator', async function () {
    let rep = null

    rep = await api.fingerprint.variants()
    expect(rep.statusCode).to.equal(200)
    expect(rep.data.success).to.be.true

    const fields = ['screen', 'cpu', 'ram', 'fonts', 'renderer', 'ua']
    for (const os of ['win', 'mac']) {
      expect(rep.data[os]).to.be.an('object')
      for (const field of fields) {
        expect(rep.data[os][field]).to.be.an('array')
      }
    }
  })
})
