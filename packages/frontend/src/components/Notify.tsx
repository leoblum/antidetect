import { message as Msg } from 'antd'

type MapOfString = { [key: string]: string | undefined }
const messages: MapOfString = {
  email_already_used: 'Email already used.',
  email_not_confirmed: 'Email not confirmed.',
  wrong_password: 'Invalid email or password.',
  reset_link_sent: 'Password reset link sent to email.',
  confirmation_link_sent: 'Confirmation link sent to email.',
}

function success (message: string) {
  return Msg.success(message)
}

function error (message: string) {
  return Msg.error(message)
}

type notifyByApiCodeProps = { success: boolean, message: string, props: any[] }
function notifyByApiCode ({ success, message: code, ...props }: notifyByApiCodeProps) {
  const handler = Msg[success ? 'success' : 'error']
  const message = messages[code] ?? null
  if (!success && message === null) console.warn('unknown message', code, props)
  return message === null ? handler(message) : null
}

const Notify = { notifyByApiCode, success, error }

export { notifyByApiCode, success, error }
export default Notify
