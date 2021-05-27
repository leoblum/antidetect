const bcrypt = require('bcrypt')

const fingerprints = require('./data/fingerprints.json')
const mailer = require('./mailer')
const models = require('./models')

const { User, Team, Profile, Proxy, LinkToken } = models

function randomChoice (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function sendConfirmationLink (user) {
  const token = await LinkToken.create({ user, action: 'create' })
  await mailer.confirmEmail({ email: user.email, token: token._id })
}

function randomFingerprint (os) {
  const values = fingerprints[os]

  return {
    os: os,
    userAgent: randomChoice(values.ua),
    screen: randomChoice(values.screen),
    cpu: randomChoice(values.cpu),
    ram: randomChoice(values.ram),
    renderer: randomChoice(values.renderer),

    noiseWebGl: true,
    noiseCanvas: false,
    noiseAudio: true,

    deviceCameras: 1,
    deviceMicrophones: 1,
    deviceSpeakers: 1,
  }
}

module.exports = {
  async checkEmail (req, rep) {
    const user = await User.findOne({ email: req.body.email })
    const exists = user !== null

    return rep.done({ exists })
  },

  async createUser (req, rep) {
    const email = req.body.email
    const password = await bcrypt.hash(req.body.password, 10)

    if (await User.findOne({ email })) return rep.fail(412, 'email_already_used')

    const team = await Team.create({ name: email })
    const user = await User.create({ email, password, team })
    await sendConfirmationLink(user)
    return rep.done(201, { message: 'confirmation_link_sent' })
  },

  async login (req, rep) {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    const pass = user !== null ? await bcrypt.compare(password, user.password) : false
    if (!pass) return rep.fail(401, 'wrong_password')
    if (!user.emailConfirmed) return rep.fail(401, 'email_not_confirmed')

    const token = await rep.jwtSign({
      user: user._id,
      team: user.team,
    })

    return rep.done({ token })
  },

  async resetPassword (req, rep) {
    // const email = req.body.email
    return rep.done({ message: 'reset_link_sent' })
  },

  async confirmEmail (req, rep) {
    // todo: make it works by tokens
    return rep.done()

    // const email = req.body.email

    // const user = await User.findOne({ email })
    // if (user.emailConfirmed) return rep.fail(409, 'email_already_confirmed')

    // user.emailConfirmed = true
    // await user.save()
    // return rep.done()
  },

  async protected (req, rep) {
    return rep.done()
  },

  async randomFingerprint (req, rep) {
    return rep.done({
      win: randomFingerprint('win'),
      mac: randomFingerprint('mac'),
    })
  },

  async fingerprintVariants (req, rep) {
    return rep.done(fingerprints)
  },

  async saveProfile (req, rep) {
    const { name, fingerprint, _id = null } = req.body
    const { team } = req.user

    if (_id) {
      const profile = await Profile.findById(_id)
      profile.name = name
      profile.fingerprint = Object.assign({}, profile.fingerprint, fingerprint) // todo: deepmerge
      await profile.save()
      return rep.done({ profile })
    }

    let proxy = req.body.proxy || null
    if (proxy) {
      proxy = Object.assign(proxy, { team })
      proxy = await Proxy.create(proxy)
    }

    const profile = await Profile.create({
      name, team, fingerprint, proxy,
    })

    return rep.done({ profile })
  },

  async profilesList (req, rep) {
    const profiles = await Profile.find({ team: req.user.team })
    return rep.done({ profiles })
  },

  async proxiesList (req, rep) {
    const proxies = await Proxy.find({ team: req.user.team })
    return rep.done({ proxies })
  },

  async createProxy (req, rep) {
    const { name, type, host, port, username, password } = req.body
    const { team } = req.user
    const proxy = await Proxy.create({
      name, team, type, host, port, username, password,
    })

    return rep.done({ proxy })
  },

  async getProfile (req, rep) {
    const { profileId } = req.params
    const profile = await Profile.findOne({ _id: profileId })
    return profile ? rep.done({ profile }) : rep.fail(404, 'profile_not_found')
  },

  async deleteProfiles (req, rep) {
    const { ids } = req.body
    await Promise.all(ids.map(_id => Profile.deleteOne({ _id })))
    return rep.done()
  },
}
