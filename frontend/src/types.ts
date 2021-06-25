/* eslint-disable @typescript-eslint/no-invalid-void-type */
export type Callback<T = void> = () => T
export type AsyncCallback<T = void> = () => Promise<T>

export * from '../../backend/src/types'

export type ApiRep = { success: boolean, [key: string]: any }

export type ApiFingerprintOS = {
  cpu: number[]
  ram: number[]
  screen: string[]
  renderer: string[]
  fonts: string[]
}

export type ApiFingerprintOptions = {
  win: ApiFingerprintOS
  mac: ApiFingerprintOS
}

// export interface Fingerprint {
//   // os: PossibleOS
//   os: string
//   win: OSFingerprint
//   mac: OSFingerprint
//   noiseWebGl: boolean
//   noiseCanvas: boolean
//   noiseAudio: boolean
//   deviceCameras: number
//   deviceMicrophones: number
//   deviceSpeakers: number
//   languages: {
//     mode: string
//     value: string
//   }
//   timezone: {
//     mode: string
//     value: string
//   }
//   geolocation: {
//     mode: string
//   }
// }

// export type iProfileBase = {
//   name: string
//   fingerprint: Fingerprint
//   proxy: null | string
// }

// export type iProfile = iProfileBase & {
//   _id: string
//   createdAt: string
//   updatedAt: string,
//   isActive: boolean,
//   currentUser: string
// }

// export type ProxyProtocol = 'socks5' | 'http'

// export type ProxyBase = {
//   name: string
//   type: ProxyProtocol
//   host: string
//   port: number
//   username: string
//   password: string
// }

// export type Proxy = ProxyBase & {
//   _id: string
//   country: string | null
// }

// export type iProfileSave = Partial<Omit<Proxy, '_id'>>
