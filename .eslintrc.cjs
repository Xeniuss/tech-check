module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
    },
    env: { browser: true, es2022: true, node: true },
    plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'jsx-a11y', 'prettier'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
    ],
    settings: {
        react: { version: 'detect' },
        'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
        'prettier/prettier': ['error'],
        'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
        'react/react-in-jsx-scope': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            { ts: 'never', tsx: 'never', js: 'never', jsx: 'never' },
        ],
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/test/**', '**/*.test.*', '**/*.stories.*', '**/vite.config.*', '**/src/**'] }],
        'jsx-a11y/anchor-is-valid': 'off',
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
};
