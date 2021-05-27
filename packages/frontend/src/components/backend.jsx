import axios from 'axios'

import createEmitter from './utils/emitter'
import storage from './utils/storage'

const http = axios.create({
  baseURL: 'http://127.0.0.1:3030',
  validateStatus: status => status < 500,
})

const wrapArray = (item) => Array.isArray(item) ? item : [item]

export const request = async ({ method, url, ...config }) => (await http.request({ method, url, ...config })).data

export const get = async (url, config) => await request({ method: 'get', url, ...config })
export const post = async (url, data, config) => await request({ method: 'post', url, data, ...config })

export const auth = {
  onAuthStateChanged: createEmitter(),

  async login ({ email, password }) {
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

  _setAuthToken (token) {
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

export const users = {
  create: async ({ email, password }) => await post('/users/create', { email, password }),
  resetPassword: async (email) => await post('/users/reset-password', { email }),
}

export const fingerprint = {
  get: async () => await get('/fingerprint'),
  variants: async () => await get('/fingerprint/options'),
}

export const profiles = {
  all: async () => await get('/profiles'),
  get: async (profileId) => await get('/profiles/' + profileId),
  save: async ({ profileId, ...values }) => await post('/profiles/save', { _id: profileId, ...values }),
  delete: async (ids) => await post('/profiles/delete', { ids: wrapArray(ids) }),
}

export const proxies = {
  all: async () => await get('/proxies'),
}

auth._setAuthToken(storage.get('authToken'))

const backend = { http, get, post, auth, users, fingerprint, profiles, proxies }
export default backend
