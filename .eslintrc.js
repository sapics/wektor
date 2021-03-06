// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    'indent': 0,
    'no-tabs': 0,
    'space-before-function-paren': 0,
    'no-new': 0,
    'eol-last': 0,
    'comma-dangle': 0,
    'curly': 0,
    'no-trailing-spaces': 0,
    'padded-blocks': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    'no-unused-vars': 0,
    'no-useless-escape': 0,
    'no-unexpected-multiline': 0,
    'semi': 0,
    'one-var': 0,
    'no-redeclare': 0,
    'space-in-parens': 0,
    'no-multi-spaces': 0,
    'eqeqeq': 0,
    'func-call-spacing': 0,
    quotes: 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
