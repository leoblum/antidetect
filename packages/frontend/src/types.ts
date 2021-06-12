// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Callback<T = void> = () => T
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type AsyncCallback<T = void> = () => Promise<T>

export interface ProfileType {
  _id: string
  name: string
  createdAt: Date
  updatedAt: Date
  fingerprint: {
    os: 'win' | 'mac'
  }
  proxy: null | 'string'
}

export interface ProxyType {
  _id: string
  name: string
  type: 'socks5' | 'http'
  host: string
  port: number
  country: string
}
