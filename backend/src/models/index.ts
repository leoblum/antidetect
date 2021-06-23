import flat from 'flat'

import LinkToken from './link-token'
import Profile from './profile'
import Proxy from './proxy'
import Team from './team'
import User from './user'

export { Proxy, LinkToken, Team, User, Profile }

export async function createOrUpdate (Model, fields) {
  const { _id } = fields
  delete fields._id

  if (_id) return await Model.findByIdAndUpdate(_id, flat(fields), { new: true })
  else return await Model.create(fields)
}

export async function existsById (Model, Id) {
  try {
    return await Model.exists({ _id: Id })
  } catch (e) { return false }
}
