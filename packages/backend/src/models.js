const {Schema, model} = require('mongoose')
const {ObjectId} = Schema.Types

const userSchema = new Schema({
  email: {type: String, required: true, unique: true, lowercase: true, trim: true},
  password: {type: String, required: true},
  createdAt: {type: Date, required: true, default: Date.now},
  emailConfirmed: {type: Boolean, required: true, default: true}, // todo: false
  team: {type: ObjectId, ref: 'Team', required: true},
})

const teamSchema = new Schema({
  name: {type: String, required: true},
})

const browserSchema = new Schema({
  name: {type: String, required: true},
  team: {type: ObjectId, ref: 'Team', required: true},
  proxy: {type: ObjectId, ref: 'Proxy', default: null},
  createdAt: {type: Date, default: Date.now, required: true},
  lastActiveAt: {type: Date, default: null},
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
  team: {type: ObjectId, ref: 'Team', required: true},
  type: {type: String, enum: ['socks5', 'https'], required: true},
  host: {type: String, required: true},
  port: {type: String, required: true},
  username: String,
  password: String,
  country: {type: String, default: null},
})

const linkTokenSchema = new Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  action: {type: String, enum: ['create', 'reset'], required: true},
  createdAt: {type: Date, default: Date.now, required: true},
})

module.exports = {
  User: model('User', userSchema),
  Team: model('Team', teamSchema),
  Browser: model('Browser', browserSchema),
  Proxy: model('Proxy', proxySchema),
  LinkToken: model('LinkToken', linkTokenSchema),
}
