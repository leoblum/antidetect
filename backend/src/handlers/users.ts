import bcrypt from 'bcrypt'
import fp from 'fastify-plugin'

import mailer from '@/mailer'
import { User, Team, LinkToken } from '@/models'

import { get, post } from './abc'

const UserCreate = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
} as const

const CheckEmail = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
  },
} as const

const UserLogin = UserCreate
const ConfirmEmail = CheckEmail

async function sendConfirmationLink (user) {
  const token = await LinkToken.create({ user, action: 'create' })
  await mailer.confirmEmail({ email: user.email, token: token._id })
}

export default fp(async srv => {
  post(srv, '/users/create', UserCreate, async (req, rep) => {
    const email = req.body.email
    const password = await bcrypt.hash(req.body.password, 10)

    if (await User.findOne({ email })) return rep.fail(412, 'email_already_used')

    const team = await Team.create({ name: email })
    const user = await User.create({ email, password, team })
    await sendConfirmationLink(user)
    return rep.done(201, { message: 'confirmation_link_sent' })
  })

  post(srv, '/users/checkEmail', CheckEmail, async (req, rep) => {
    const user = await User.findOne({ email: req.body.email })
    const exists = user !== null
    return rep.done({ exists })
  })

  post(srv, '/users/login', UserLogin, async (req, rep) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return rep.fail(401, 'user_not_found')
    if (!user.emailConfirmed) return rep.fail(401, 'email_not_confirmed')
    if (!await bcrypt.compare(password, user.password)) return rep.fail(401, 'wrong_password')

    const token = await rep.jwtSign({
      user: user._id,
      team: user.team,
    })

    return rep.done({ token })
  })

  post(srv, '/users/resetPassword', null, async (req, rep) => {
    // const email = req.body.email
    return rep.done({ message: 'reset_link_sent' })
  })

  post(srv, '/users/confirmEmail', ConfirmEmail, async (req, rep) => {
    const email = req.body.email

    const user = await User.findOne({ email })
    if (!user) return rep.fail(409, 'user_not_found')
    if (user.emailConfirmed) return rep.fail(409, 'email_already_confirmed')

    user.emailConfirmed = true
    await user.save()
    return rep.done()
  })

  get(srv, '/users/checkToken', null, async (req, rep) => {
    return rep.done()
  }, true)
})
