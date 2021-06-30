module.exports = {
  root: true,
  extends: ['standard'],
  parserOptions: { ecmaVersion: 12 },
  settings: {
    'import/resolver': { alias: { map: [['@', './src']], extensions: ['.js', '.jsx', '.ts', '.tsx'] } },
  },
  rules: {
    curly: 'off',
    'no-template-curly-in-string': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'import/no-unresolved': 'error',
    'import/no-named-as-default-member': 'off',
    'import/order': ['error', {
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
      pathGroups: [{ pattern: '@/**', group: 'external', position: 'after' }],
    }],
  },
  overrides: [{
    files: ['**/*.ts', '**/*.tsx'],
    parser: '@typescript-eslint/parser',
    parserOptions: { project: './tsconfig.json' },
    extends: ['plugin:@typescript-eslint/recommended'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }],

      indent: 'off',
      '@typescript-eslint/indent': ['error', 2],
      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': 'off',
      '@typescript-eslint/object-curly-spacing': ['error', 'always'],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
    },
  }, {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js', '**/*.test.jsx'],
    extends: ['plugin:mocha/recommended'],
    rules: {
      'mocha/no-setup-in-describe': 'off',
      'mocha/no-mocha-arrows': 'off',
      'no-unused-expressions': 'off',
      'import/order': 'off',
    },
  }],
}
