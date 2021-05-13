module.exports = function createClient (mochaContext) {
  if (mochaContext.api) return mochaContext.api

  const app = mochaContext.app
  const api = {
    headers: {},

    async request (method, url, opts = {}) {
      opts.method = method
      opts.url = url
      opts.headers = Object.assign({}, this.headers, opts.headers || {})

      let rep = await app.inject(opts)
      Object.defineProperty(rep, 'data', {get: () => rep.json()})
      return rep
    },

    async get (url, opts = {}) {
      return await this.request('get', url, opts)
    },

    async post (url, payload, opts = {}) {
      opts.payload = payload
      return await this.request('post', url, opts)
    },

    async checkEmailExists (email) {
      return await this.post('/users/checkEmail', {email})
    },

    async createUser (email, password) {
      return await this.post('/users/create', {email, password})
    },

    async confirmEmail (email) {
      return await this.post('/users/confirmEmail', {email})
    },

    async auth (email, password, keepToken = false) {
      let rep = await this.post('/users/auth', {email, password})
      if (keepToken && rep.json().success) {
        this.headers['Authorization'] = `Bearer ${rep.json().token}`
      }
      return rep
    },

    async protected () {
      return await this.get('/protected')
    },

    async getFingerprint () {
      return await this.get('/fingerprint')
    },

    async getFingerprintOptions () {
      return await this.get('/fingerprint/options')
    },

    async createBrowser (name, fingerprint, proxy) {
      return await this.post('/browsers/create', {name, fingerprint, proxy})
    },

    async browsersList () {
      return await this.get('/browsers')
    },

    async createProxy (data) {
      return this.post('/proxies/create', data)
    },

    async proxiesList () {
      return await this.get('/proxies')
    },
  }

  mochaContext.api = api
  return api
}
