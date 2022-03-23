module.exports = {
    ...require('@packages/eslint/next'),
    parserOptions: {
        project: './tsconfig.json',
        tsConfigRootDir: __dirname,
        ecmaFeatures: {
            jsx: true
        }
    }
};
