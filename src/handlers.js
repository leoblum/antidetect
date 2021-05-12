const bcrypt = require('bcrypt')
const models = require('./models')
const fingerprints = require('./data/fingerprints.json')

const {User} = models

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

async function compareUserCredentials (email, password) {
  const user = await User.findOne({email})
  if (user === null) return false

  return await bcrypt.compare(password, user.password)
}

module.exports = {
  async checkEmail (req, rep) {
    const user = await User.findOne({email: req.body.email})
    const exists = user !== null

    return rep.code(200).send({success: true, exists})
  },

  async register (req, rep) {
    const email = req.body.email
    const password = await bcrypt.hash(req.body.password, 10)

    if (await User.findOne({email})) {
      return rep.code(412).send({success: false, message: 'email_already_used'})
    }

    await User.create({email, password})
    return rep.code(201).send({success: true})
  },

  async auth (req, rep) {
    const {email, password} = req.body
    const passed = await compareUserCredentials(email, password)
    if (!passed) return rep.code(401).send({success: false})

    const token = await req.fastify.jwt.sign({})
    return rep.code(200).send({success: true, token})
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
}
