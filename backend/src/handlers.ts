import { Type } from '@sinclair/typebox'
import bcrypt from 'bcrypt'

import { handlerFunc } from './abc'
import { UserModel, TeamModel, ProxyModel, createOrUpdate, ProfileModel, existsById } from './models'
import fingerprints from './~fingerprints.json'

// async function sendConfirmationLink (user: typeof UserModel) {
// const token = await LinkTokenModel.create({ user, action: 'create' })
// await mailer.confirmEmail({ email: user.email, token: token._id })
// }

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

// Users CRUD

export const usersCreate = handlerFunc({
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
  }),
}).public(async (req, rep) => {
  const email = req.body.email
  const password = await bcrypt.hash(req.body.password, 10)

  if (await UserModel.findOne({ email })) return rep.fail('email_already_used', 412)

  const team = await TeamModel.create({ name: email })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = await UserModel.create({ email, password, teamId: team._id })
  // await sendConfirmationLink(user)
  return rep.done({ message: 'confirmation_link_sent' }, 201)
})

export const usersAuth = handlerFunc({
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
  }),
}).public(async (req, rep) => {
  const { email, password } = req.body

  const user = await UserModel.findOne({ email })
  if (!user) return rep.fail('user_not_found', 401)
  if (!user.emailConfirmed) return rep.fail('email_not_confirmed', 401)
  if (!await bcrypt.compare(password, user.password)) return rep.fail('wrong_password', 401)

  const token = await rep.jwtSign({ userId: user._id, teamId: user.teamId })
  return rep.done({ token })
})

export const usersCheckEmail = handlerFunc({
  body: Type.Object({
    email: Type.String({ format: 'email' }),
  }),
}).public(async (req, rep) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const exists = user !== null
  return rep.done({ exists })
})

export const usersResetPassword = handlerFunc({
  body: Type.Object({
    email: Type.String({ format: 'email' }),
  }),
}).public(async (req, rep) => {
  // const email = req.body.email
  return rep.done({ message: 'reset_link_sent' })
})

export const usersConfirmEmail = handlerFunc({
  body: Type.Object({
    email: Type.String({ format: 'email' }),
  }),
}).public(async (req, rep) => {
  const email = req.body.email

  const user = await UserModel.findOne({ email })
  if (!user) return rep.fail('user_not_found', 409)
  if (user.emailConfirmed) return rep.fail('email_already_confirmed', 409)

  user.emailConfirmed = true
  await user.save()
  return rep.done()
})

export const usersCheckToken = handlerFunc().private(async (req, rep) => {
  return rep.done()
})

// Fingerprints

export const fingerprintGet = handlerFunc().private(async (req, rep) => {
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

export const fingerprintOptions = handlerFunc().private(async (req, rep) => {
  return rep.done(fingerprints)
})

// Proxies CRUD

export const proxyGetAll = handlerFunc().private(async (req, rep) => {
  const proxies = await ProxyModel.find({ teamId: req.user.teamId })
  return rep.done({ proxies })
})

export const proxyGet = handlerFunc({
  params: Type.Object({ proxyId: Type.String() }),
}).private(async (req, rep) => {
  const proxy = await ProxyModel.findById(req.params.proxyId)
  return proxy ? rep.done({ proxy }) : rep.fail('not_found', 404)
})

const ProxyFields = Type.Object({
  name: Type.String(),
  type: Type.String(),
  host: Type.String(),
  port: Type.Number(),
  username: Type.String(),
  password: Type.String(),
})

export const proxyUpdate = handlerFunc({
  params: Type.Object({ proxyId: Type.Optional(Type.String()) }),
  body: ProxyFields,
}).private(async (req, rep) => {
  const { teamId } = req.user
  const proxyId = req.params.proxyId
  const proxy = await createOrUpdate(ProxyModel, { ...req.body, teamId, _id: proxyId })
  return rep.done({ proxy })
})

export const proxyDelete = handlerFunc({
  body: Type.Object({ ids: Type.Array(Type.String()) }),
}).private(async (req, rep) => {
  const { ids } = req.body
  try {
    await Promise.all(ids.map(id => ProxyModel.findByIdAndRemove(id)))
  } catch (e) {}
  return rep.done()
})

// Profiles CRUD

export const profileGetAll = handlerFunc().private(async (req, rep) => {
  const { teamId } = req.user
  const profiles = await ProfileModel.find({ teamId })
  return rep.done({ profiles })
})

export const profileGet = handlerFunc({
  params: Type.Object({ profileId: Type.String() }),
}).private(async (req, rep) => {
  const profile = await ProfileModel.findById(req.params.profileId)
  return profile ? rep.done({ profile }) : rep.fail('not_found', 404)
})

export const profileUpdate = handlerFunc({
  params: Type.Object({ profileId: Type.Optional(Type.String()) }),
  body: Type.Object({
    name: Type.Optional(Type.String()),
    fingerprint: Type.Optional(Type.Any()),
    proxy: Type.Union([Type.String(), Type.Null(), ProxyFields]),
  }),
}).private(async (req, rep) => {
  const { teamId } = req.user
  const { profileId } = req.params

  const validateProxy = async (proxyId: string | null) => {
    if (!proxyId || !proxyId.length) return null
    return await existsById(ProxyModel, proxyId) ? proxyId : null
  }

  const proxy = req.body.proxy
  if (typeof proxy === 'string' || proxy === null) req.body.proxy = await validateProxy(proxy)
  else {
    const doc = await ProxyModel.create({ ...proxy, teamId })
    req.body.proxy = doc._id.toString()
  }

  const profile = await createOrUpdate(ProfileModel, { teamId, ...req.body, _id: profileId })
  return rep.done({ profile })
})

export const profileDelete = handlerFunc({
  body: Type.Object({ ids: Type.Array(Type.String()) }),
}).private(async (req, rep) => {
  const { ids } = req.body
  try {
    await Promise.all(ids.map(id => ProfileModel.findByIdAndRemove(id)))
  } catch (e) {}
  return rep.done()
})

// Profiles actions

export const profileLock = handlerFunc({
  params: Type.Object({ profileId: Type.String() }),
}).private(async (req, rep) => {
  const profileId = req.params.profileId
  const profile = await ProfileModel.findById(profileId)
  if (profile === null) return rep.fail('profile_not_found', 404)
  if (profile.activeStatus) return rep.fail('profile_alredy_started', 409)

  profile.activeStatus = true
  profile.activeUserId = req.user.userId
  await profile.save()

  return rep.done({ profile })
})

export const profileUnlock = handlerFunc({
  params: Type.Object({ profileId: Type.String() }),
}).private(async (req, rep) => {
  const profileId = req.params.profileId
  const profile = await ProfileModel.findById(profileId)
  if (profile === null) return rep.fail('profile_not_found', 404)

  profile.activeStatus = false
  profile.activeUserId = null
  await profile.save()

  return rep.done({ profile })
})
