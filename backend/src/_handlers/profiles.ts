import fp from 'fastify-plugin'

import { Profile, Proxy, createOrUpdate, existsById } from '../_models'

import { get, post } from './abc'
import { ProxyUpdate } from './proxies'

const ProfileUpdate = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    proxy: { type: 'string' },
    proxyCreate: ProxyUpdate,
    fingerprint: {
      type: 'object',
      properties: {
      },
    },
  },
} as const

const ProfileDelete = {
  type: 'object',
  required: ['ids'],
  properties: {
    ids: { type: 'array', items: { type: 'string' } },
  },
} as const

export default fp(async srv => {
  get(srv, '/profiles', null, async (req, rep) => {
    const { team } = req.user
    const profiles = await Profile.find({ team })
    return rep.done({ profiles })
  }, true)

  get(srv, '/profiles/:profileId', null, async (req, rep) => {
    const profile = await Profile.findById(req.params.profileId)
    return profile ? rep.done({ profile }) : rep.fail(404, 'not_found')
  }, true)

  post(srv, '/profiles/save', ProfileUpdate, async (req, rep) => {
    const { team } = req.user

    const validateProxy = async (proxyId: string | undefined) => {
      if (!proxyId || !proxyId.length) return null
      return await existsById(Proxy, proxyId) ? proxyId : null
    }

    req.body.proxy = await validateProxy(req.body.proxy)

    if (req.body.proxyCreate) {
      const { proxyCreate } = req.body
      delete req.body.proxyCreate

      const proxy = await Proxy.create({ ...proxyCreate, team })
      req.body.proxy = proxy._id.toString()
    }

    const profile = await createOrUpdate(Profile, { team, ...req.body })
    return rep.done({ profile })
  }, true)

  post(srv, '/profiles/delete', ProfileDelete, async (req, rep) => {
    const { ids } = req.body
    try {
      await Promise.all(ids.map(id => Profile.findByIdAndRemove(id)))
    } catch (e) {}
    return rep.done()
  }, true)
})
