module.exports = function createClient (app) {
  const DefaultHeaders = {}

  const request = async ({ method, url, ...opts }) => {
    const headers = { ...DefaultHeaders, ...opts.headers }
    const rep = await app.inject({ ...opts, method, url, headers })
    Object.defineProperty(rep, 'data', { get: () => rep.json() })
    return rep
  }
  const get = async (url, opts = {}) => await request({ method: 'get', url, ...opts })
  const post = async (url, payload, opts = {}) => await request({ method: 'post', url, payload, ...opts })

  const users = {
    checkEmailExists: async (email) => await post('/users/checkEmail', { email }),
    create: async (email, password) => await post('/users/create', { email, password }),
    confirmEmail: async (email) => await post('/users/confirmEmail', { email }),
    auth: async (email, password) => {
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
    get: async (profileId) => await get(`/profiles/${profileId}`),
    save: async ({ profileId, name, fingerprint, proxy = null }) => (
      await post('/profiles/save', { _id: profileId, name, fingerprint, proxy })
    ),
    delete: async ({ ids = [] }) => await post('/profiles/delete', { ids }),
  }

  const proxies = {
    list: async () => await get('/proxies'),
    get: async (proxyId) => await get(`/proxies/${proxyId}`),
    save: async ({ proxyId, name, type, host, port, username, password }) => (
      await post('/proxies/save', { _id: proxyId, name, type, host, port, username, password })
    ),
    delete: async ({ ids = [] }) => await post('/proxies/delete', { ids }),
  }

  return {
    headers: DefaultHeaders,
    request,
    get,
    post,
    users,
    fingerprint,
    profiles,
    proxies,
  }
}
