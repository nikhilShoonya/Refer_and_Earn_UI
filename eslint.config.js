const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'web-build/**', 'assets/figma/**'],
  },
  {
    files: ['jest.setup.js', '**/__mocks__/**', '**/__tests__/**', 'scripts/**'],
    languageOptions: {
      globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly',
                 beforeEach: 'readonly', afterEach: 'readonly', require: 'readonly',
                 module: 'writable', Buffer: 'readonly', process: 'readonly',
                 console: 'readonly', fetch: 'readonly', setTimeout: 'readonly' },
    },
  },
  {
    rules: {
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];
