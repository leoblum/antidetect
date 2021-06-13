module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 12, sourceType: 'module' },

  extends: ['standard', 'plugin:react/recommended'],
  plugins: ['react'],
  rules: {
    'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
    'no-unreachable': 'warn',
    'comma-dangle': ['error', 'always-multiline'],
    'import/no-unresolved': 'error',
    'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
    'react/prop-types': 'off',
    'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
    'react/jsx-uses-react': 'error',
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
  },
  settings: {
    'import/resolver': { alias: { map: [['@', './src']], extensions: ['.js', '.jsx', '.ts', '.tsx'] } },
    react: { version: 'detect' },
  },

  overrides: [{
    files: ['**/*.ts', '**/*.tsx'],
    parser: '@typescript-eslint/parser',
    parserOptions: { project: './tsconfig.json' },

    extends: ['standard-with-typescript'],
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',

      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],

      'object-curly-spacing': 'off',
      '@typescript-eslint/object-curly-spacing': ['error', 'always'],

      // 'no-use-before-define': 'off',
      // '@typescript-eslint/no-use-before-define': ['error'],

      // indent: 'off',
      // '@typescript-eslint/indent': ['error', 2],
      // '@typescript-eslint/type-annotation-spacing': ['error', { before: true, after: true }],
    },
  }],
}
