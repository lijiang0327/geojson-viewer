module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'react/jsx-props-no-spreading': ['off'],
    'no-console': 'off',
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'CallExpression[callee.object.name="console"][callee.property.name=/(log|warn|error|trace|info)/]',
        message: 'no-console',
      },
    ],
  },
};
