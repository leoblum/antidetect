import { Schema, model } from 'mongoose'

import { Profile } from '@/types'

const ProtectionMode = { type: String, enum: ['ip', 'real', 'manual'] }

const Hardware = {
  userAgent: String,
  screen: String,
  renderer: String,
  cpu: Number,
  ram: Number,
}

const schema = new Schema<Profile>({
  name: { type: String, required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  proxy: { type: Schema.Types.ObjectId, ref: 'Proxy', default: null },
  isActive: { type: Boolean, default: false },
  currentUser: { type: Schema.Types.ObjectId, ref: 'User' },
  fingerprint: {
    os: { type: String, enum: ['win', 'mac'], required: true },
    mac: Hardware,
    win: Hardware,
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

const Profile = model<Profile>('Profile', schema)
export { Profile }
