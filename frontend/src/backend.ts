import axios from 'axios'

import createEmitter from '@/common/emitter'
import storage from '@/common/storage'
import { Fingerprint, Profile, Proxy, ProxyBase, ApiFingerprintOptions, ApiRep } from '@/types'

import { ProfileUpdate } from '../../backend/src/types'

type Method = 'get' | 'post'
type Url = string
type Config = { data?: any }
type FinalConfig = Config & { method: Method, url: Url }

const http = axios.create({
  baseURL: 'http://127.0.0.1:3030',
  validateStatus: status => status < 400,
})

export async function request ({ method, url, ...config }: FinalConfig): Promise<ApiRep> {
  const data = (await http.request({ method, url, ...config })).data
  console.info(`${method} ${url}`, config.data, data)
  return data
}

export async function get (url: string, config: Config = {}) {
  return await request({ method: 'get', url, ...config })
}

export async function post (url: string, data: any, config: Config = {}) {
  return await request({ method: 'post', url, data, ...config })
}

export const auth = {
  onAuthStateChanged: createEmitter(),

  async login ({ email, password }: { email: string, password: string }) {
    const rep = await post('/users/login', { email, password })
    if (rep.success) this._setAuthToken(rep.token)
    return rep
  },

  async logout () {
    this._setAuthToken(null)
    return { succes: true }
  },

  isAuth () {
    return 'Authorization' in http.defaults.headers
  },

  _setAuthToken (token: string | null) {
    storage.set('authToken', token)
    if (token === null) {
      delete http.defaults.headers.Authorization
      this.onAuthStateChanged.fire(false)
    } else {
      http.defaults.headers.Authorization = `Bearer ${token}`
      this.onAuthStateChanged.fire(true)
    }
  },
}

type UsersCreate = { email: string, password: string }
export const users = {
  create: async ({ email, password }: UsersCreate) => await post('/users/create', { email, password }),
  resetPassword: async (email: string) => await post('/users/reset-password', { email }),
}

export const fingerprint = {
  async get () {
    const rep = await get('/fingerprint')
    return (rep.fingerprint) as Fingerprint
  },

  async variants () {
    const rep = await get('/fingerprint/options')
    const res: ApiFingerprintOptions = { win: rep.win, mac: rep.mac }
    return res
  },
}

export const proxies = {
  async list () {
    const rep = await get('/proxies')
    return (rep.proxies) as Proxy[]
  },

  async get (proxyId: string) {
    const rep = await get('/proxies/' + proxyId)
    return (rep.proxy) as Proxy
  },

  async save (values: ProxyBase, proxyId?: string) {
    const url = proxyId ? `/proxies/save/${proxyId}` : '/proxies/save'
    return await post(url, { ...values })
  },

  async delete (ids: string[]) {
    return await post('/proxies/delete', { ids })
  },
}

export const profiles = {
  async list () {
    const rep = await get('/profiles')
    return (rep.profiles) as Profile[]
  },

  async get (profileId: string) {
    const rep = await get('/profiles/' + profileId)
    return (rep.profile) as Profile
  },

  async save (values: ProfileUpdate, profileId?: string) {
    const url = profileId ? `/profiles/save/${profileId}` : '/profiles/save'
    return await post(url, { ...values })
  },

  async delete (ids: string[]) {
    return await post('/profiles/delete', { ids })
  },

  async lock (profileId: Profile['_id']) {
    return await get(`/profiles/lock/${profileId}`)
  },

  async unlock (profileId: Profile['_id']) {
    return await get(`/profiles/unlock/${profileId}`)
  },
}

auth._setAuthToken(storage.get('authToken'))

const backend = { http, get, post, auth, users, fingerprint, profiles, proxies }
export default backend
