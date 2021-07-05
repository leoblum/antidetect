import { createClient, Rep } from './helper'

describe('fingerprints', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should return random fingerprint for win & mac', async function () {
    const rep = await api.fingerprint.get()
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data.fingerprint).to.be.an('object')
    rep.expect(rep.data.fingerprint.win).to.be.an('object')
    rep.expect(rep.data.fingerprint.mac).to.be.an('object')
  })

  it('should return fingerprint options for generator', async function () {
    let rep: Rep

    rep = await api.fingerprint.variants()
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    const fields = ['screen', 'cpu', 'ram', 'fonts', 'renderer', 'ua']
    for (const os of ['win', 'mac']) {
      rep.expect(rep.data[os]).to.be.an('object')
      for (const field of fields) {
        rep.expect(rep.data[os][field], `${os}.${field}`).to.be.an('array')
      }
    }
  })
})
