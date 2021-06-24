import flat from 'flat'

export { LinkToken } from './link-token'
export { Profile } from './profile'
export { Proxy } from './proxy'
export { TeamModel } from './team'
export { UserModel } from './user'

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
