// New flat ESLint config only to declare ignored files/folders
// This avoids the runtime warning about `.eslintignore` being deprecated
module.exports = [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '.vite/**',
            'public/**',
            '.DS_Store',
            '.idea',
            '.vscode',
            'coverage',
        ],
    },
];
