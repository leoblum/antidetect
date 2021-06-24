// import nodemailer from 'nodemailer'

export default {
  transporter: null,

  async init () {
    // const testAccount = await nodemailer.createTestAccount()
    // const testAccount = { user: 'user', pass: 'pass' }
    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.ethereal.email',
    //   port: 587,
    //   secure: false,
    //   auth: { user: testAccount.user, pass: testAccount.pass },
    // })

    // this.transporter = transporter
  },

  async confirmEmail ({ email, token }: { email: string, token: string }) {
    return Promise.resolve()

    // return await this.transporter.sendMail({
    //   from: '"Fred Foo 👻" <foo@example.com>',
    //   to: email,
    //   subject: 'Hello ✔',
    //   text: 'Hello world?',
    // })
  },
}
