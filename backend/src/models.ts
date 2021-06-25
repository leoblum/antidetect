import flat from 'flat'
import { Schema, model } from 'mongoose'

import type { LinkToken, User, Team, Proxy, Profile } from '@/types'

const TeamSchema = new Schema<Team>({
  name: { type: String, required: true },
}, { timestamps: true })

const UserSchema = new Schema<User>({
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  emailConfirmed: { type: Boolean, required: true, default: false },
}, { timestamps: true })

const LinkTokenSchema = new Schema<LinkToken>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['create', 'reset'], required: true },
}, { timestamps: true })

const ProxySchema = new Schema<Proxy>({
  name: String,
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, enum: ['socks4', 'socks5', 'http', 'https', 'ssh'], required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  username: { type: String, default: null },
  password: { type: String, default: null },
  country: { type: String, default: null },
}, { timestamps: true })

const ProtectionMode = {
  type: String,
  enum: ['ip', 'real', 'manual'],
}

const Hardware = {
  userAgent: String,
  screen: String,
  renderer: String,
  cpu: Number,
  ram: Number,
}

const ProfileSchema = new Schema<Profile>({
  name: { type: String, required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  proxy: { type: Schema.Types.ObjectId, ref: 'Proxy', default: null },
  isActive: { type: Boolean, default: false },
  currentUser: { type: Schema.Types.ObjectId, ref: 'User' },
  fingerprint: {
    os: { type: String, enum: ['win', 'mac'], required: true },
    win: Hardware,
    mac: Hardware,
    deviceCameras: Number,
    deviceMicrophones: Number,
    deviceSpeakers: Number,
    noiseAudio: Boolean,
    noiseCanvas: Boolean,
    noiseWebGl: Boolean,
    languages: { mode: ProtectionMode, value: String },
    geolocation: { mode: ProtectionMode, latitude: String, longitude: String },
    timezone: { mode: ProtectionMode, value: String },
  },
}, { timestamps: true })

export const UserModel = model<User>('User', UserSchema)
export const TeamModel = model<Team>('Team', TeamSchema)
export const LinkTokenModel = model<LinkToken>('LinkToken', LinkTokenSchema)
export const ProxyModel = model<Proxy>('Proxy', ProxySchema)
export const ProfileModel = model<Profile>('Profile', ProfileSchema)

export async function createOrUpdate (Model: any, fields: any) {
  const { _id } = fields
  delete fields._id

  if (_id) return await Model.findByIdAndUpdate(_id, flat(fields), { new: true })
  else return await Model.create(fields)
}

export async function existsById (Model: any, Id: string) {
  try {
    return await Model.exists({ _id: Id })
  } catch (e) { return false }
}
