// https://github.com/standard/eslint-config-standard/blob/master/eslintrc.json
// https://www.npmjs.com/package/@typescript-eslint/eslint-plugin

module.exports = {
  root: true,
  extends: [
    'standard',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
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

    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
    'react/jsx-uses-react': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react-hooks/exhaustive-deps': 'off',
  },
  overrides: [{
    files: ['**/*.ts', '**/*.tsx'],
    parser: '@typescript-eslint/parser',
    parserOptions: { project: './tsconfig.json' },
    extends: [
      'plugin:@typescript-eslint/recommended',
      // 'plugin:import/typescript',
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      indent: 'off',
      '@typescript-eslint/indent': ['error', 2],

      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],

      'object-curly-spacing': 'off',
      '@typescript-eslint/object-curly-spacing': ['error', 'always'],

      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
    },
  }],
}
