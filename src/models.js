const {Schema, model} = require('mongoose')
const {ObjectId} = Schema.Types

const userSchema = new Schema({
  email: {type: String, required: true, unique: true, lowercase: true, trim: true},
  password: {type: String, required: true},
  createdAt: {type: Date, required: true, default: Date.now},
  emailConfirmed: {type: Boolean, required: true, default: false},
  team: {type: ObjectId, ref: 'Team', required: true},
})

const teamSchema = new Schema({
  name: {type: String, required: true},
})

const browserSchema = new Schema({
  name: {type: String, required: true},
  team: {type: ObjectId, ref: 'Team', required: true},
  proxy: {type: ObjectId, ref: 'Proxy'},
  createdAt: {type: Date, default: Date.now, required: true},
  lastActiveAt: Date,
  isActive: {type: Boolean, default: false},
  currentUser: {type: ObjectId, ref: 'User'},
  fingerprint: {
    os: {type: String, enum: ['win', 'mac']},
    userAgent: String,
    screen: String,
    renderer: String,
    cpu: Number,
    ram: Number,
  },
})

const proxySchema = new Schema({
  name: String,
  team: {type: ObjectId, ref: 'Team'},
  type: {type: String, enum: ['socks5', 'https']},
  host: String,
  port: String,
  username: String,
  password: String,
  country: String,
})

module.exports = {
  User: model('User', userSchema),
  Team: model('Team', teamSchema),
  Browser: model('Browser', browserSchema),
  Proxy: model('Proxy', proxySchema),
}
