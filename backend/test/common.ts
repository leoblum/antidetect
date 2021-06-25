import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import type { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import buildApp from '@/app'
import config from '@/config'
import type { OS, Profile, ProfileUpdate, Proxy, ProxyUpdate } from '@/types'
chai.use(chaiAsPromised)

const ObjectId = mongoose.Types.ObjectId

declare module 'light-my-request' {
  export interface Response {
    data: any
  }
}

type StrObj = Record<string, string>
type ReqOps = { method?: 'get' | 'post', url?: string, payload?: any, headers?: StrObj }
type Ids = { ids: string[] }

export function createClient () {
  const DefaultHeaders: StrObj = {}
  const mongod = new MongoMemoryServer()
  let app: FastifyInstance

  const request = async ({ method, url, ...opts }: ReqOps) => {
    const headers = { ...DefaultHeaders, ...opts.headers }
    const rep = await app.inject({ ...opts, method, url, headers })
    Object.defineProperty(rep, 'data', { get: () => rep.json() })
    if (!('success' in rep.data)) throw new Error(JSON.stringify(rep.json()))
    return rep
  }

  const get = async (url: string, opts: ReqOps = {}) => {
    return await request({ ...opts, method: 'get', url })
  }

  const post = async (url: string, payload: any, opts: ReqOps = {}) => {
    return await request({ ...opts, method: 'post', url, payload })
  }

  const users = {
    checkEmailExists: async (email: string) => await post('/users/checkEmail', { email }),
    create: async (email: string, password: string) => await post('/users/create', { email, password }),
    confirmEmail: async (email: string) => await post('/users/confirmEmail', { email }),
    auth: async (email: string, password: string) => {
      const rep = await post('/users/login', { email, password })
      if (rep.data.success) DefaultHeaders.Authorization = `Bearer ${rep.data.token}`
      return rep
    },
    checkAuth: async () => await get('/users/checkToken'),
  }

  const fingerprint = {
    get: async () => await get('/fingerprint'),
    variants: async () => await get('/fingerprint/options'),
  }

  const profiles = {
    list: async () => await get('/profiles'),
    get: async (profileId: string) => await get(`/profiles/${profileId}`),
    save: async ({ name, fingerprint, proxy = null }: ProfileUpdate, profileId?: string) => (
      await post(profileId ? `/profiles/save/${profileId}` : '/profiles/save', { name, fingerprint, proxy })
    ),
    delete: async ({ ids = [] }: Ids) => await post('/profiles/delete', { ids }),
  }

  const proxies = {
    list: async () => await get('/proxies'),
    get: async (proxyId: string) => await get(`/proxies/${proxyId}`),
    save: async (opts: ProxyUpdate, proxyId?: string) => (
      await post(proxyId ? `/proxies/save/${proxyId}` : '/proxies/save', opts)
    ),
    delete: async ({ ids = [] }: Ids) => await post('/proxies/delete', { ids }),
  }

  const DefaultEmail = 'user@example.com'
  const DefaultPassword = '1234'

  const fill = {
    async user (email = DefaultEmail, password = DefaultPassword) {
      await users.create(email, password)
      await users.confirmEmail(email)
      await users.auth(email, password)
    },

    async proxy ({
      name = '1234', type = 'http', host = 'localhost', port = 8080, username = '', password = '',
    }: Partial<Proxy>) {
      const rep = await proxies.save({ name, type, host, port, username, password })
      return rep.data.proxy as Proxy
    },

    async fingerprint (os: string) {
      const data = (await fingerprint.get()).data.fingerprint
      data.os = os
      return data
    },

    async profile ({ name = '1234', os = 'mac', proxy = null }: ProfileUpdate & { os?: OS }) {
      const fingerprint = await this.fingerprint(os)
      return (await profiles.save({ name, fingerprint, proxy })).data.profile as Profile
    },
  }

  before(async () => {
    config.MONGODB_URI = await mongod.getUri('yanus-test')
    app = await buildApp()
    if (!app.db.name.endsWith('-test')) throw new Error('Wrong DB name!')
  })

  after(async () => {
    await app.close()
    await mongod.stop()
  })

  beforeEach(async () => {
    delete DefaultHeaders.Authorization
    await app.db.dropDatabase()
  })

  return { headers: DefaultHeaders, request, get, post, users, fingerprint, profiles, proxies, fill }
}

export type ApiClient = ReturnType<typeof createClient>

export const blankId = () => ObjectId().toString()
export const invalidId = () => '1234'
export const fill = async <T>(len: number, cb: (idx: number) => Promise<T>) => {
  return await Promise.all(new Array(len).map(idx => cb(idx)))
}
