module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single']
    },
    globals: {
        module: true,
        require: true,
        __dirname: true
    }
}
