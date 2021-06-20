require('dotenv-defaults/config')

// todo: add validation

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yanus',
  JWT_SECRET: process.env.JWT_SECRET || 'secret-token',
}
