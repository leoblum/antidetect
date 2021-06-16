const { Proxy, createOrUpdate } = require('../models')

async function list (req, rep) {
  const proxies = await Proxy.find({ team: req.user.team })
  return rep.done({ proxies })
}

async function get (req, rep) {
  const proxy = await Proxy.findById(req.params.proxyId)
  return proxy ? rep.done({ proxy }) : rep.fail(404, 'not_found')
}

async function save (req, rep) {
  const { team } = req.user
  const proxy = await createOrUpdate(Proxy, { team, ...req.body })
  return rep.done({ proxy })
}

async function remove (req, rep) {
  const { ids } = req.body
  await Promise.all(ids.map(id => Proxy.findByIdAndRemove(id)))
  return rep.done()
}

module.exports = { list, get, save, remove }
