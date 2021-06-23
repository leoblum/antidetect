import fp from 'fastify-plugin'

import { Proxy, createOrUpdate } from './../models'
import { get, post } from './abc'

export const ProxyUpdate = {
  type: 'object',
  required: ['name', 'type', 'host', 'port', 'username', 'password'],
  properties: {
    name: { type: 'string' },
    type: { type: 'string' },
    host: { type: 'string' },
    port: { type: 'number' },
    username: { type: 'string' },
    password: { type: 'string' },
  },
} as const

const ProxyDelete = {
  type: 'object',
  required: ['ids'],
  properties: {
    ids: { type: 'array', items: { type: 'string' } },
  },
} as const

export default fp(async srv => {
  get(srv, '/proxies', null, async (req, rep) => {
    const proxies = await Proxy.find({ team: req.user.team })
    return rep.done({ proxies })
  }, true)

  get(srv, '/proxies/:proxyId', null, async (req, rep) => {
    const proxy = await Proxy.findById(req.params.proxyId as string)
    return proxy ? rep.done({ proxy }) : rep.fail(404, 'not_found')
  }, true)

  post(srv, '/proxies/save', ProxyUpdate, async (req, rep) => {
    const { team } = req.user
    const proxy = await createOrUpdate(Proxy, { team, ...req.body })
    return rep.done({ proxy })
  }, true)

  post(srv, '/proxies/delete', ProxyDelete, async (req, rep) => {
    const { ids } = req.body
    try {
      await Promise.all(ids.map(id => Proxy.findByIdAndRemove(id)))
    } catch (e) {}
    return rep.done()
  }, true)
})
