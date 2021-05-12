module.exports = function createClient (app) {
  async function request (method, url, opts = {}) {
    opts.method = method
    opts.url = url
    return await app.inject(opts)
  }

  async function get (url, opts = {}) {
    return await request('get', url, opts)
  }

  async function post (url, payload, opts = {}) {
    opts.payload = payload
    return await request('post', url, opts)
  }

  return {
    async checkEmailExists (email) {
      return await post('/users/checkEmail', {email})
    },

    async createUser (email, password) {
      return await post('/users/create', {email, password})
    },

    async confirmEmail (email) {
      return await post('/users/confirmEmail', {email})
    },

    async auth (email, password) {
      return await post('/users/auth', {email, password})
    },
  }
}
