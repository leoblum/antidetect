import { message as Msg } from 'antd'

const messages = {
  email_already_used: 'Email already used.',
  email_not_confirmed: 'Email not confirmed.',
  wrong_password: 'Invalid email or password.',
  reset_link_sent: 'Password reset link sent to email.',
  confirmation_link_sent: 'Confirmation link sent to email.',
}

function success (message) {
  return Msg.success(message)
}

function error (message) {
  return Msg.error(message)
}

function notifyByApiCode ({ success, message: code, ...props }) {
  const handler = Msg[success ? 'success' : 'error']
  const message = messages[code]
  if (!success && !message) console.warn('unknown message', code, props)
  return message ? handler(message) : null
}

const Notify = { notifyByApiCode, success, error }

export { notifyByApiCode, success, error }
export default Notify
