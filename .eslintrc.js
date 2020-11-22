module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true,
    },
    "extends": [
        "airbnb-base",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
    },
    "parserOptions": {
        "ecmaVersion": 2020,
    },
    "rules": {
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-console': 0,
        'no-continue': 0,
        'no-underscore-dangle': ['error', { 'allow': ['_id'] }],
        'no-param-reassign': 0,
    },
};
