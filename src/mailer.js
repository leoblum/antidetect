const nodemailer = require('nodemailer')

module.exports = {
  transporter: null,

  async init () {
    const testAccount = await nodemailer.createTestAccount()
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    this.transporter = transporter
  },

  async confirmEmail ({email, token}) {
    console.log(email, token)

    return await this.transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: email,
      subject: 'Hello ✔',
      text: 'Hello world?',
    })
  },
}
