const bcrypt = require('bcrypt')

const mailer = require('../mailer')
const { User, Team, LinkToken } = require('../models')

async function sendConfirmationLink (user) {
  const token = await LinkToken.create({ user, action: 'create' })
  await mailer.confirmEmail({ email: user.email, token: token._id })
}

async function checkEmail (req, rep) {
  const user = await User.findOne({ email: req.body.email })
  const exists = user !== null

  return rep.done({ exists })
}

async function create (req, rep) {
  const email = req.body.email
  const password = await bcrypt.hash(req.body.password, 10)

  if (await User.findOne({ email })) return rep.fail(412, 'email_already_used')

  const team = await Team.create({ name: email })
  const user = await User.create({ email, password, team })
  await sendConfirmationLink(user)
  return rep.done(201, { message: 'confirmation_link_sent' })
}

async function login (req, rep) {
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
}

async function checkToken (req, rep) {
  return rep.done()
}

async function resetPassword (req, rep) {
  // const email = req.body.email
  return rep.done({ message: 'reset_link_sent' })
}

async function confirmEmail (req, rep) {
  // todo: make it works by tokens
  return rep.done()

  // const email = req.body.email

  // const user = await User.findOne({ email })
  // if (user.emailConfirmed) return rep.fail(409, 'email_already_confirmed')

  // user.emailConfirmed = true
  // await user.save()
  // return rep.done()
}

module.exports = { create, login, checkToken, checkEmail, confirmEmail, resetPassword }
