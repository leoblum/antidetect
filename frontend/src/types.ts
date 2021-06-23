/* eslint-disable @typescript-eslint/no-invalid-void-type */
export type Callback<T = void> = () => T
export type AsyncCallback<T = void> = () => Promise<T>

export type iApiReplay = { success: boolean, [key: string]: any }

export interface iFingerprintOS {
  cpu: number[]
  ram: number[]
  screen: string[]
  renderer: string[]
  fonts: string[]
}

export interface iFingerprintOptions {
  win: iFingerprintOS
  mac: iFingerprintOS
}

export interface iFingerprintItem {
  userAgent: string
  cpu: number
  ram: number
  screen: string
  render: string
}

export type PossibleOS = 'win' | 'mac'

export interface iFingerprint {
  // os: PossibleOS
  os: string
  win: iFingerprintItem
  mac: iFingerprintItem
  noiseWebGl: boolean
  noiseCanvas: boolean
  noiseAudio: boolean
  deviceCameras: number
  deviceMicrophones: number
  deviceSpeakers: number
  languages: {
    mode: string
    value: string
  }
  timezone: {
    mode: string
    value: string
  }
  geolocation: {
    mode: string
  }
}

export type iProfileBase = {
  name: string
  fingerprint: iFingerprint
  proxy: null | string
}

export type iProfile = iProfileBase & {
  _id: string
  createdAt: string
  updatedAt: string,
  isActive: boolean,
  currentUser: string
}

export type iProxyProtocol = 'socks5' | 'http'

export type iProxyBase = {
  name: string
  type: iProxyProtocol
  host: string
  port: number
  username: string
  password: string
}

export type iProxy = iProxyBase & {
  _id: string
  country: string | null
}

export type iProfileSave = Partial<Omit<iProxy, '_id'>>
