import { createClient, blankId, invalidId, Rep } from './helper'
import { Proxy } from '@/types'

const PROXY = { name: '1234', type: 'http' as const, host: 'localhost', port: 8080, username: 'user', password: 'pass' }

describe('proxies', function () {
  const api = createClient()
  beforeEach(() => api.fill.user())

  it('should create proxy', async function () {
    let rep: Rep

    rep = await api.proxies.list()
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data.proxies).to.be.an('array')
    rep.expect(rep.data.proxies).to.have.lengthOf(0)

    rep = await api.proxies.save(PROXY)
    // expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data).to.have.property('proxy')
    rep.expect(rep.data.proxy).to.be.an('object')

    rep.expect(rep.data.proxy._id).to.be.a('string')
    rep.expect(rep.data.proxy.teamId).to.be.a('string')
    rep.expect(rep.data.proxy.name).to.equal('1234')
    rep.expect(rep.data.proxy.type).to.equal('http')
    rep.expect(rep.data.proxy.port).to.equal(8080)
    rep.expect(rep.data.proxy.username).to.equal('user')
    rep.expect(rep.data.proxy.password).to.equal('pass')
    rep.expect(rep.data.proxy.country).to.be.null

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(1)
  })

  it('should create proxy with empty login & password', async function () {
    let rep: Rep

    rep = await api.proxies.save({ ...PROXY, username: '', password: '' })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data).to.have.property('proxy')
    rep.expect(rep.data.proxy).to.be.an('object')
    rep.expect(rep.data.proxy.username).to.equal('')
    rep.expect(rep.data.proxy.password).to.equal('')

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(1)
  })

  it('should get proxy by id', async function () {
    let rep: Rep
    const id1 = (await api.proxies.save(PROXY)).data.proxy._id

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(1)

    rep = await api.proxies.get(id1)
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
  })

  it('should update by id', async function () {
    let rep: Rep

    rep = await api.proxies.save(PROXY)
    rep.expect(rep.data.success).to.be.true

    const proxyId = rep.data.proxy._id
    const name = 'test-rename'

    rep = await api.proxies.save({ ...PROXY, name }, proxyId)
    rep.expect(rep.data.success).to.be.true
    rep.expect(rep.data.proxy).to.be.an('object')
    rep.expect(rep.data.proxy._id).to.equal(proxyId)
    rep.expect(rep.data.proxy.name).to.equal(name)

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(1)
  })

  it('should delete by id', async function () {
    let rep: Rep

    const id1 = (await api.proxies.save(PROXY)).data.proxy._id as string

    rep = await api.proxies.delete({ ids: [id1] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    rep = await api.proxies.get(id1)
    rep.expect(rep.statusCode).to.equal(404)
    rep.expect(rep.data.success).to.be.false
    rep.expect(rep.data.message).to.be.equal('not_found')

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(0)
  })

  it('should delete by id (bulk)', async function () {
    let rep: Rep
    const id1 = (await api.fill.proxy({ name: '101' }))._id
    const id2 = (await api.fill.proxy({ name: '102' }))._id
    const id3 = (await api.fill.proxy({ name: '103' }))._id

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(3)

    rep = await api.proxies.delete({ ids: [id1, id2] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.lengthOf(1)
    rep.expect(rep.data.proxies[0]._id).to.equal(id3)
  })

  it('should delete with success=true on invalid id', async function () {
    let rep: Rep

    rep = await api.proxies.delete({ ids: [blankId()] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true

    rep = await api.proxies.delete({ ids: [invalidId()] })
    rep.expect(rep.statusCode).to.equal(200)
    rep.expect(rep.data.success).to.be.true
  })

  const f = (len: number): string[] => new Array(len).fill(0).map((_, idx) => idx.toString())
  const p = async (len: number) => await Promise.all(f(len).map(name => api.fill.proxy({ name })))

  it('should delete by id from many', async function () {
    let rep: Rep
    const ids = (await p(10)).map(x => x._id)

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.length(10)
    rep.expect(rep.data.proxies.map((x: Proxy) => x._id)).to.have.all.members(ids)

    const toDelete = ids.pop() as string
    rep.expect(ids).to.have.length(9)
    rep.expect(ids).to.not.include(toDelete)
    rep = await api.proxies.delete({ ids: [toDelete] })

    rep = await api.proxies.list()
    rep.expect(rep.data.proxies).to.have.length(9)
    rep.expect(rep.data.proxies.map((x: Proxy) => x._id)).to.not.include(toDelete)
    rep.expect(rep.data.proxies.map((x: Proxy) => x._id)).to.have.all.members(ids)
  })
})
