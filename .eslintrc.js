module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  overrides: [
    {
      files: ['**/*.spec.js', '**/*.spec.jsx'],
      env: {
        mocha: true,
      },
      rules: {
        'no-unused-expressions': 'off',
      },
    },
  ],
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {},
};
