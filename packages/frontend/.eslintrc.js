module.exports = {
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'eslint-config-standard-with-typescript',
  ],
  parserOptions: { project: './tsconfig.json' },
  rules: {
    'import/no-unresolved': 'error',
    'import/order': ['error', {
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
      pathGroups: [{ pattern: '@/**', group: 'external', position: 'after' }],
    }],

    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',

    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],

    'object-curly-spacing': 'off',
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
  },
  settings: {
    'import/resolver': { alias: { map: [['@', './src']], extensions: ['.js', '.jsx', '.ts', '.tsx'] } },
    react: { version: 'detect' },
  },
  overrides: [{
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'comma-dangle': ['error', 'always-multiline'],
    },
  }],
}
