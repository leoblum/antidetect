module.exports = {
  env: { browser: true, commonjs: true, es2021: true },
  extends: [
    'standard',
    'plugin:mocha/recommended',
  ],
  parserOptions: { ecmaVersion: 12 },
  plugins: [
    'mocha',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'import/no-unresolved': 'error',
    'import/order': ['error', {
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    }],
  },
}
