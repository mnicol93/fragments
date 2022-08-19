module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    // https://eslint.org/docs/user-guide/configuring/language-options#specifying-environments
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {},
};
