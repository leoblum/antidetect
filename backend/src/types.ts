export type OS = 'win' | 'mac'
export type ProxyProtocol = 'http' | 'socks5'

export type MongoDefaults = {
  _id: string
  createdAt: Date
  updatedAt: Date
}

export type Team = {
  name: string
}

export type LinkToken = {
  user: string
  action: 'create' | 'reset'
}

export type OSFingerprint = {
  cpu: number
  ram: number
  screen: string
  render: string
  userAgent: string
}

export type Fingerprint = {
  os: OS
  win: OSFingerprint
  mac: OSFingerprint
  noiseWebGl: boolean
  noiseCanvas: boolean
  noiseAudio: boolean
  deviceCameras: number
  deviceMicrophones: number
  deviceSpeakers: number
  languages: { mode: string; value: string }
  timezone: { mode: string; value: string }
  geolocation: { mode: string }
}

export type ProxyBase = {
  name: string
  type: ProxyProtocol
  host: string
  port: number
  username: string
  password: string
}

export type ProxyUpdate = Partial<ProxyBase>

export type Proxy = ProxyBase & MongoDefaults & {
  country: string | null
}

export type ProfileBase = {
  name: string
  fingerprint: Fingerprint
  proxy: string | null
}

export type ProfileUpdate = Partial<Omit<ProfileBase, 'fingerprint' | 'proxy'>> & {
  fingerprint?: Partial<Fingerprint>
  proxy?: string | null | ProxyBase
}

export type ProfileUpdate2 = Partial<Omit<ProfileBase,  'proxy'>> & {
  proxy?: string | null | ProxyBase
}

export type Profile = ProfileBase & MongoDefaults & {
  isActive: boolean
  currentUser: string
}

export type UserBase = {
  team: string
  email: string
  password: string
  emailConfirmed: boolean
}

export type User = UserBase & MongoDefaults
