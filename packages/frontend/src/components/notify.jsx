import {message as Notify} from 'antd'

const messages = {
  email_already_used: 'Email already used.',
  email_not_confirmed: 'Email not confirmed.',
  wrong_password: 'Invalid email or password.',
  reset_link_sent: 'Password reset link sent to email.',
  confirmation_link_sent: 'Confirmation link sent to email.',
}

function notifyByApiCode ({success, message: code, ...props}) {
  let handler = Notify[success ? 'success' : 'error']
  let message = messages[code]
  if (!success && !message) console.warn('unknown message', code, props)
  return message ? handler(message) : null
}

export {notifyByApiCode}
