// https://docs.expo.dev/guides/using-eslint/
module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'expo',
        'plugin:react/recommended',
        'prettier',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['expo', 'react', 'react-native', '@typescript-eslint', 'react-hooks', 'prettier'],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react-native/no-unused-styles': 2,
        '@typescript-eslint/no-require-imports': 'off',
        eqeqeq: ['warn', 'always'],
        'no-console': 'warn',
        'no-debugger': 'error',
        'prettier/prettier': 'error',
    },
    ignorePatterns: [
        'node_modules/',
        'android/',
        'ios/',
        'web-build/',
        'dist/',
        'build/',
        '.expo/',
        '.expo-shared/',
        'assets/',
        'coverage/',
        'babel.config.js',
        'metro.config.js',
        'jest.config.js',
    ],
};
