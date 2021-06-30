import { message as Msg } from 'antd'

import { ApiRep } from '@/types'

type MapOfString = { [key: string]: string | undefined }
const messages: MapOfString = {
  email_already_used: 'Email already used.',
  email_not_confirmed: 'Email not confirmed.',
  wrong_password: 'Invalid email or password.',
  reset_link_sent: 'Password reset link sent to email.',
  confirmation_link_sent: 'Confirmation link sent to email.',
}

function success (message: string) {
  Promise.all([Msg.success(message)]).catch(console.error)
}

function error (message: string) {
  Promise.all([Msg.error(message)]).catch(console.error)
}

function notifyByApiCode ({ success, message: code }: ApiRep) {
  const handler = Msg[success ? 'success' : 'error']
  const message = messages[code] ?? null
  if (!success && message === null) console.warn('unknown message', code)
  if (message !== null) Promise.all([handler(message)]).catch(console.error)
}

const Notify = { notifyByApiCode, success, error }

export { notifyByApiCode, success, error }
export default Notify
