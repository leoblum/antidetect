module.exports = function createClient (app) {
  return {
    headers: {},

    async request (method, url, opts = {}) {
      opts.method = method
      opts.url = url
      opts.headers = Object.assign({}, this.headers, opts.headers || {})
      return await app.inject(opts)
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
      return await this.post('/protected', {})
    },
  }
}
