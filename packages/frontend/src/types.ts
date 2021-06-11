export type CallbackVoid = () => void

export type ProxyType = {
  _id: string
  name: string
  type: 'socks5' | 'http'
  host: string
  port: number
  country: string
}
