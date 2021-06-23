// https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.js

module.exports = {
  require: ['ts-node/register/transpile-only', 'tsconfig-paths/register'],
  spec: 'test/**/*.test.ts',
  recursive: true,
  'full-trace': true
}