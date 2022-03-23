module.exports = {
    ...require('@packages/eslint/next'),
    parserOptions: {
        root: true,
        project: './tsconfig.json',
        tsConfigRootDir: __dirname,
        ecmaFeatures: {
            jsx: true
        }
    }
};
