module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
    },
    plugins: [
        'sonarjs',
        'promise',
        'unicorn',
        '@typescript-eslint',
        'prettier',
    ],
    extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:promise/recommended',
        'plugin:unicorn/recommended',
        'plugin:sonarjs/recommended',
        'prettier',
        'prettier/unicorn',
        'prettier/react',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    exclude: ['node_modules/**/*'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
    },
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    rules: {
        'no-console': 0,
        'no-continue': 0,
        'no-underscore-dangle': 0,
        'no-param-reassign': 0,
    },
};
