module.exports = {
  env: { browser: true, es2021: true },
  extends: [
    'standard',
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  settings: {
    'import/resolver': { node: { extensions: ['.js', '.jsx'] } },
    react: { version: 'detect' },
  },
  rules: {
    'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
    'no-unreachable': 'warn',
    'comma-dangle': ['error', 'always-multiline'],
    'import/no-unresolved': 'error',
    'import/order': ['error', {
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    }],
    'react/prop-types': 'off',
    'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
    'react/jsx-uses-react': 'error',
    'react/jsx-indent': ['error', 2],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
  },
}
