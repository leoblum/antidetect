/* eslint-disable @typescript-eslint/consistent-type-definitions */
import axios from 'axios'

import createEmitter from '@/utils/emitter'
import storage from '@/utils/storage'

type Method = 'get' | 'post'
type Url = string
type Config = { data?: any }
type FinalConfig = Config & { method: Method, url: Url }
type ApiRep = { success: boolean, [key: string]: any }

const http = axios.create({
  baseURL: 'http://127.0.0.1:3030',
  validateStatus: status => status < 500,
})

export async function request ({ method, url, ...config }: FinalConfig): Promise<ApiRep> {
  const data = (await http.request({ method, url, ...config })).data
  console.log(`api\t${method}\t${url}\nreq`, config.data, '\nrep', data)
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
  get: async () => await get('/fingerprint'),
  variants: async () => await get('/fingerprint/options'),
}

type ProfilesSave = { profileId: string }
export const profiles = {
  list: async () => await get('/profiles'),
  get: async (profileId: string) => await get('/profiles/' + profileId),
  save: async ({ profileId, ...values }: ProfilesSave) => await post('/profiles/save', { _id: profileId, ...values }),
  delete: async (ids: string[]) => await post('/profiles/delete', { ids }),
}

type ProxySave = { proxyId: string }
export const proxies = {
  list: async () => await get('/proxies'),
  get: async (proxyId: string) => await get('/proxies/' + proxyId),
  save: async ({ proxyId, ...values }: ProxySave) => await post('/proxies/save', { _id: proxyId, ...values }),
  delete: async (ids: string[]) => await post('/proxies/delete', { ids }),
}

auth._setAuthToken(storage.get('authToken'))

const backend = { http, get, post, auth, users, fingerprint, profiles, proxies }
export default backend
