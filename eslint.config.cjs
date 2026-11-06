const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh').default;

module.exports = tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/coverage/**',
            '**/.vercel/**'
        ]
    },

    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],

        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },

        settings: {
            react: {
                version: 'detect'
            }
        },

        rules: {
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,

            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',

            'react-refresh/only-export-components': [
                'warn',
                {
                    allowConstantExport: true
                }
            ],

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_'
                }
            ]
        }
    }
);