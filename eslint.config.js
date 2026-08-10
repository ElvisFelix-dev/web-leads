import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Desativa a necessidade de importar o React no topo (React 17+)
      'react/prop-types': 'off', // Opcional: Desativa aviso de prop-types se não usar
      'prettier/prettier': 'error', // Força o Prettier a apontar erros visuais no ESLint
    },
    settings: {
      react: { version: 'detect' }, // Detecta automaticamente a versão do React
    },
  },
  configPrettier, // Desativa regras do ESLint que conflitam com o Prettier
];
