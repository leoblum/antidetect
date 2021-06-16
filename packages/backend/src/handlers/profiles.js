const { Profile, Proxy, createOrUpdate } = require('../models')

async function list (req, rep) {
  const { team } = req.user
  const profiles = await Profile.find({ team })
  return rep.done({ profiles })
}

async function get (req, rep) {
  const profile = await Profile.findById(req.params.profileId)
  return profile ? rep.done({ profile }) : rep.fail(404, 'not_found')
}

async function save (req, rep) {
  const { team } = req.user

  if (req.body.proxyCreate) {
    const { proxyCreate } = req.body
    delete req.body.proxyCreate

    const proxy = await Proxy.create({ ...proxyCreate, team })
    req.body.proxy = proxy._id.toString()
  }

  const profile = await createOrUpdate(Profile, { team, ...req.body })
  return rep.done({ profile })
}

async function remove (req, rep) {
  const { ids } = req.body
  await Promise.all(ids.map(id => Profile.findByIdAndRemove(id)))
  return rep.done()
}

module.exports = { list, get, save, remove }
