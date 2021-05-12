const bcrypt = require('bcrypt')
const models = require('./models')
const fingerprints = require('./data/fingerprints.json')

const {User, Team} = models

function randomChoice (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomFingerprint (os = null) {
  const values = fingerprints[os]

  return {
    os: os,
    userAgent: randomChoice(values.ua),
    screen: randomChoice(values.screen),
    cpu: randomChoice(values.cpu),
    ram: randomChoice(values.ram),
    renderer: randomChoice(values.renderer),
  }
}

module.exports = {
  async checkEmail (req, rep) {
    const user = await User.findOne({email: req.body.email})
    const exists = user !== null

    return rep.done({exists})
  },

  async createUser (req, rep) {
    const email = req.body.email
    const password = await bcrypt.hash(req.body.password, 10)

    if (await User.findOne({email})) return rep.fail(412, 'email_already_used')

    const team = await Team.create({name: email})
    const user = await User.create({email, password, team})
    return rep.done(201)
  },

  async auth (req, rep) {
    const {email, password} = req.body

    const user = await User.findOne({email})
    const pass = user !== null ? await bcrypt.compare(password, user.password) : false
    if (!pass) return rep.fail(401, 'wrong_password')
    if (!user.emailConfirmed) return rep.fail(401, 'email_not_confirmed')

    const token = await req.fastify.jwt.sign({
      user: user._id,
      team: user.team,
    })

    return rep.done({token})
  },

  async confirmEmail (req, rep) {
    const email = req.body.email

    const user = await User.findOne({email})
    if (user.emailConfirmed) return rep.fail(409, 'email_already_confirmed')

    user.emailConfirmed = true
    await user.save()
    return rep.done()
  },

  async protected (req, rep) {
    return {}
  },

  async randomFingerprint (req, rep) {
    return {
      win: randomFingerprint('win'),
      mac: randomFingerprint('mac'),
    }
  },

  async fingerprintVariants (req, rep) {
    return fingerprints
  },

  async createBrowser (req, rep) {

  },
}
