module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  globals: {
    Markdown: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'eslint:recommended',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      { endOfLine: 'auto' },
      {
        usePrettierrc: true,
        tabWidth: 2,
        useTabs: true,
      },
    ],
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: 10,
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
      },
    ],
    'vue/singleline-html-element-content-newline': 0,
  },
}
