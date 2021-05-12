const mongoose = require('mongoose')
const ObjectId = mongoose.ObjectId

const User = mongoose.model('User', {
  email: {type: 'String', required: true, unique: true, lowercase: true, trim: true},
  password: {type: 'String', required: true},
  createdAt: {type: 'Date', required: true, default: Date.now},
  emailConfirmed: {type: 'Boolean', required: true, default: false},
  teamId: {type: ObjectId, ref: 'Team'},
})

const Team = mongoose.model('Team', {
  name: String,
})

const Browser = mongoose.model('Browser', {
  name: String,
  teamId: {type: ObjectId, ref: 'Team'},
  proxyId: {type: ObjectId, ref: 'Proxy'},
  createdAt: Date,
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

const Proxy = mongoose.model('Proxy', {
  name: String,
  teamId: {type: ObjectId, ref: 'Team'},
  type: {type: String, enum: ['socks5', 'https']},
  host: String,
  port: String,
  username: String,
  password: String,
  country: String,
})

module.exports = {ObjectId, User, Team, Browser, Proxy}
