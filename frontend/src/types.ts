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
