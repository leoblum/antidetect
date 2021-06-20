const flat = require('flat')
const { Schema, model } = require('mongoose')
const { ObjectId } = Schema.Types

const ProtectionMode = { type: String, enum: ['ip', 'real', 'manual'] }

const Hardware = {
  userAgent: String,
  screen: String,
  renderer: String,
  cpu: Number,
  ram: Number,
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  emailConfirmed: { type: Boolean, required: true, default: true }, // todo: false
  team: { type: ObjectId, ref: 'Team', required: true },
}, { timestamps: true })

const teamSchema = new Schema({
  name: { type: String, required: true },
}, { timestamps: true })

const profileSchema = new Schema({
  name: { type: String, required: true },
  team: { type: ObjectId, ref: 'Team', required: true },
  proxy: { type: ObjectId, ref: 'Proxy', default: null },
  isActive: { type: Boolean, default: false },
  currentUser: { type: ObjectId, ref: 'User' },
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

const proxySchema = new Schema({
  name: String,
  team: { type: ObjectId, ref: 'Team', required: true },
  type: { type: String, enum: ['socks4', 'socks5', 'http', 'https', 'ssh'], required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  username: { type: String, default: null },
  password: { type: String, default: null },
  country: { type: String, default: null },
}, { timestamps: true })

const linkTokenSchema = new Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['create', 'reset'], required: true },
}, { timestamps: true })

async function createOrUpdate (Model, fields) {
  const { _id } = fields
  delete fields._id

  if (_id) return await Model.findByIdAndUpdate(_id, flat(fields), { new: true })
  else return await Model.create(fields)
}

async function existsById (Model, Id) {
  try {
    return await Model.exists({ _id: Id })
  } catch (e) { return false }
}

module.exports = {
  User: model('User', userSchema),
  Team: model('Team', teamSchema),
  Profile: model('Profile', profileSchema),
  Proxy: model('Proxy', proxySchema),
  LinkToken: model('LinkToken', linkTokenSchema),
  createOrUpdate,
  existsById,
}
