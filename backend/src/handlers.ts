import bcrypt from 'bcrypt'

import { pubHandler, pvtHandler, S } from './abc'
import { UserModel, TeamModel, ProxyModel, createOrUpdate, ProfileModel, existsById } from './models'
import fingerprints from './~fingerprints.json'

function randomChoice<T> (arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomHardware (os: 'win' | 'mac') {
  const values = fingerprints[os]

  return {
    userAgent: randomChoice(values.ua),
    screen: randomChoice(values.screen),
    cpu: randomChoice(values.cpu),
    ram: randomChoice(values.ram),
    renderer: randomChoice(values.renderer),
  }
}

// async function sendConfirmationLink (user: typeof UserModel) {
// const token = await LinkTokenModel.create({ user, action: 'create' })
// await mailer.confirmEmail({ email: user.email, token: token._id })
// }

const UsersCreate = S({
  email: { type: 'string', format: 'email' },
  password: { type: 'string' },
} as const)

const UsersAuth = S({
  email: { type: 'string', format: 'email' },
  password: { type: 'string' },
} as const)

const UsersCheckEmail = S({
  email: { type: 'string', format: 'email' },
} as const)

const UsersResetPassword = S({
  email: { type: 'string', format: 'email' },
} as const)

const UsersConfirmEmail = S({
  email: { type: 'string', format: 'email' },
} as const)

const ProxyUpdate = S({
  name: { type: 'string' },
  type: { type: 'string' },
  host: { type: 'string' },
  port: { type: 'number' },
  username: { type: 'string' },
  password: { type: 'string' },
} as const)

const ProxyDelete = S({
  ids: { type: 'array', items: { type: 'string' } },
} as const)

const ProxyGetParams = S({
  proxyId: { type: 'string' },
} as const)

// const Fingerprint = S({
// os: { type: 'string' },
// } as const)

// const ProfileUpdate = S({
//   name: { type: 'string' },
//   // proxy: { type: ['string', 'null'] },
//   // proxy: { type: ['string', 'null'] },
//   proxy: { anyOf: [ProxyUpdate, { type: ['string', 'null'] }] },
//   // fingerprint: Fingerprint,
//   fingerprint: { type: 'object' },
// } as const)

const ProfileUpdate = S(null, {
  name: { type: 'string' },
  proxy: { anyOf: [ProxyUpdate, { type: ['string', 'null'] }] },
  fingerprint: { type: 'object' },
} as const)

const ProfileDelete = S({
  ids: { type: 'array', items: { type: 'string' } },
} as const)

const ProfileGetParams = S({
  profileId: { type: 'string' },
} as const)

export const usersCreate = pubHandler({ body: UsersCreate }, async (req, rep) => {
  const email = req.body.email
  const password = await bcrypt.hash(req.body.password, 10)

  if (await UserModel.findOne({ email })) return rep.fail('email_already_used', 412)

  const team = await TeamModel.create({ name: email })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = await UserModel.create({ email, password, team })
  // await sendConfirmationLink(user)
  return rep.done({ message: 'confirmation_link_sent' }, 201)
})

export const usersAuth = pubHandler({ body: UsersAuth }, async (req, rep) => {
  const { email, password } = req.body

  const user = await UserModel.findOne({ email })
  if (!user) return rep.fail('user_not_found', 401)
  if (!user.emailConfirmed) return rep.fail('email_not_confirmed', 401)
  if (!await bcrypt.compare(password, user.password)) return rep.fail('wrong_password', 401)

  const token = await rep.jwtSign({ user: user._id, team: user.team })
  return rep.done({ token })
})

export const usersCheckEmail = pubHandler({ body: UsersCheckEmail }, async (req, rep) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const exists = user !== null
  return rep.done({ exists })
})

export const usersResetPassword = pubHandler({ body: UsersResetPassword }, async (req, rep) => {
  // const email = req.body.email
  return rep.done({ message: 'reset_link_sent' })
})

export const usersConfirmEmail = pubHandler({ body: UsersConfirmEmail }, async (req, rep) => {
  const email = req.body.email

  const user = await UserModel.findOne({ email })
  if (!user) return rep.fail('user_not_found', 409)
  if (user.emailConfirmed) return rep.fail('email_already_confirmed', 409)

  user.emailConfirmed = true
  await user.save()
  return rep.done()
})

export const usersCheckToken = pvtHandler(null, async (req, rep) => {
  return rep.done()
})

export const fingerprintGet = pvtHandler(null, async (req, rep) => {
  const acceptLanguage = (req.headers['accept-language'] || '')
    .split(',').map(x => x.split(';')[0]).filter(x => x.length > 0).join(',') || null

  const fingerprint = {
    os: randomChoice(['win', 'mac']),

    win: randomHardware('win'),
    mac: randomHardware('mac'),

    noiseWebGl: true,
    noiseCanvas: false,
    noiseAudio: true,

    deviceCameras: 1,
    deviceMicrophones: 1,
    deviceSpeakers: 1,

    languages: { mode: 'ip', value: acceptLanguage },
    timezone: { mode: 'ip' },
    geolocation: { mode: 'ip' },
  }

  return rep.done({ fingerprint })
})

export const fingerprintOptions = pvtHandler(null, async (req, rep) => {
  return rep.done(fingerprints)
})

export const proxyGetAll = pvtHandler(null, async (req, rep) => {
  const proxies = await ProxyModel.find({ team: req.user.team })
  return rep.done({ proxies })
})

export const proxyGet = pvtHandler({ params: ProxyGetParams }, async (req, rep) => {
  const proxy = await ProxyModel.findById(req.params.proxyId)
  return proxy ? rep.done({ proxy }) : rep.fail('not_found', 404)
})

const ProxyUpdateParams = { type: 'object', properties: { proxyId: { type: 'string' } } } as const
export const proxyUpdate = pvtHandler({ body: ProxyUpdate, params: ProxyUpdateParams }, async (req, rep) => {
  const { team } = req.user
  const proxyId = req.params.proxyId
  const proxy = await createOrUpdate(ProxyModel, { team, ...req.body, _id: proxyId })
  return rep.done({ proxy })
})

export const proxyDelete = pvtHandler({ body: ProxyDelete }, async (req, rep) => {
  const { ids } = req.body
  try {
    await Promise.all(ids.map(id => ProxyModel.findByIdAndRemove(id)))
  } catch (e) {}
  return rep.done()
})

export const profileGetAll = pvtHandler(null, async (req, rep) => {
  const { team } = req.user
  const profiles = await ProfileModel.find({ team })
  return rep.done({ profiles })
})

export const profileGet = pvtHandler({ params: ProfileGetParams }, async (req, rep) => {
  const profile = await ProfileModel.findById(req.params.profileId)
  return profile ? rep.done({ profile }) : rep.fail('not_found', 404)
})

const ProfileUpdateParams = { type: 'object', properties: { profileId: { type: 'string' } } } as const
export const profileUpdate = pvtHandler({ body: ProfileUpdate, params: ProfileUpdateParams }, async (req, rep) => {
  const { team } = req.user
  const { profileId } = req.params

  const validateProxy = async (proxyId: string | null) => {
    if (!proxyId || !proxyId.length) return null
    return await existsById(ProxyModel, proxyId) ? proxyId : null
  }

  const proxy = req.body.proxy
  if (typeof proxy === 'string' || proxy === null) req.body.proxy = await validateProxy(proxy)
  else {
    const doc = await ProxyModel.create({ ...proxy, team })
    req.body.proxy = doc._id.toString()
  }

  const profile = await createOrUpdate(ProfileModel, { team, ...req.body, _id: profileId })
  return rep.done({ profile })
})

export const profileDelete = pvtHandler({ body: ProfileDelete }, async (req, rep) => {
  const { ids } = req.body
  try {
    await Promise.all(ids.map(id => ProfileModel.findByIdAndRemove(id)))
  } catch (e) {}
  return rep.done()
})
