/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('@packages/eslint/base');
const _ = require('lodash');

const config = {
    extends: ['next', 'next/core-web-vitals'],
    env: {
        browser: true
    },
    plugins: ['react', '@next/eslint-plugin-next'],
    rules: {
        '@typescript-eslint/strict-boolean-expressions': 'off'
    },
    ignorePatterns: ['next-env.d.ts']
};

const result  = _.mergeWith(base, config, (el, src) => {
    if (Array.isArray(el)) {
        return el.concat(src);
    }
    return undefined;
});

result.rules['@typescript-eslint/explicit-function-return-type'] = 'off';
module.exports = result;
