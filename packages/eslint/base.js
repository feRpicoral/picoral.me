module.exports = {
    parser: '@typescript-eslint/parser',
    env: {
        es6: true
    },
    ignorePatterns: [
        'node_modules',
        '.next',
        '.turbo',
        'out',
        'build',
        'dist',
        'coverage'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended'
    ],
    plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                arrowParens: 'avoid',
                trailingComma: 'none',
                tabWidth: 4,
                singleQuote: true
            }
        ],
        '@typescript-eslint/consistent-type-definitions': [
            'error',
            'interface'
        ],
        '@typescript-eslint/no-confusing-non-null-assertion': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/ban-ts-comment': [
            'error',
            {
                'ts-expect-error': 'allow-with-description',
                'ts-ignore': 'allow-with-description',
                'ts-nocheck': 'allow-with-description',
                'ts-check': 'allow-with-description'
            }
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-function-return-type': [
            'error',
            { allowExpressions: true }
        ],
        '@typescript-eslint/strict-boolean-expressions': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_' }
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'no-void': ['error', { allowAsStatement: true }],
        'array-callback-return': 'error',
        'consistent-return': 'error',
        'default-case': 'error',
        'default-case-last': 'error',
        eqeqeq: 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'no-implicit-globals': 'error',
        'no-implied-eval': 'error',
        'no-multi-str': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-return-assign': 'error',
        'no-self-compare': 'error',
        'no-throw-literal': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-useless-concat': 'error',
        radix: 'off',
        'require-await': 'error',
        'no-label-var': 'error',
        'lines-between-class-members': 'off',
        'max-lines': 'warn',
        'multiline-comment-style': 'off',
        'no-array-constructor': 'error',
        'no-bitwise': 'error',
        'no-lonely-if': 'error',
        'no-multi-assign': 'error',
        'no-new-object': 'error',
        'no-unneeded-ternary': 'error',
        'operator-assignment': 'error',
        'prefer-object-spread': 'error',
        'spaced-comment': ['error', 'always'],
        'arrow-body-style': 'error',
        'no-duplicate-imports': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-rename': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-const': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error'
    }
};
