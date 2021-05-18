import axios from 'axios'
import {createEmitter, storageGet, storageSet} from './utils'

console.log('willow.bruen25@ethereal.email')

class ServerApi {
  constructor () {
    this.http = axios.create({
      baseURL: 'http://127.0.0.1:3030',
      validateStatus: status => status < 500,
    })

    this.onAuthStateChanged = createEmitter()
    this.setAuthToken(storageGet('authToken'))
  }

  get isAuth () {
    return 'Authorization' in this.http.defaults.headers
  }

  setAuthToken (token = null) {
    storageSet('authToken', token)
    if (token === null) {
      delete this.http.defaults.headers['Authorization']
      this.onAuthStateChanged.fire(false)
    }
    else {
      this.http.defaults.headers['Authorization'] = `Bearer ${token}`
      this.onAuthStateChanged.fire(true)
    }
  }

  async get (url) {
    const rep = await this.http.get(url)
    return rep.data
  }

  async post (url, data) {
    const rep = await this.http.post(url, data)
    return rep.data
  }

  async login ({email, password}) {
    const rep = await this.post('/users/login', {email, password})
    if (rep.success) this.setAuthToken(rep.token)
    return rep
  }

  async logout () {
    this.setAuthToken(null)
  }

  async createUser ({email, password}) {
    return await this.post('/users/create', {email, password})
  }

  async resetPassword ({email}) {
    return await this.post('/users/reset-password', {email})
  }

  async browsers () {
    return await this.get('/browsers')
  }

  async proxies () {
    return await this.get('/proxies')
  }
}

export default new ServerApi()
