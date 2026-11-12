// @ts-check
// TypeScript 6 не подключает @types/* сам (types по умолчанию — []), а import.meta.dirname описан в @types/node
/// <reference types="node" />
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import checkFile from 'eslint-plugin-check-file';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Слои фронта и из каких слоёв каждому можно импортировать (docs/frontend.md)
const WEB_LAYERS = {
  app: ['app', 'pages', 'widgets', 'features', 'entities', 'core', 'shared', 'mocks'],
  pages: ['pages', 'widgets', 'features', 'entities', 'core', 'shared'],
  widgets: ['widgets', 'features', 'entities', 'core', 'shared'],
  features: ['features', 'entities', 'core', 'shared'],
  entities: ['entities', 'core', 'shared'],
  core: ['core', 'entities', 'shared'],
  shared: ['shared'],
  mocks: ['mocks', 'shared'],
};

// Один конфиг на весь репозиторий. `eslint .` внутри пакета находит его, поднимаясь по папкам вверх.
export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/.turbo/**',
      '**/generated/**',
      // Генерирует MSW (npx msw init), руками не правим
      'apps/web/public/mockServiceWorker.js',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Правила, которым нужна информация о типах
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    // В api пишем в лог через logger из apps/api/src/common/logger.ts, а не через console
    files: ['apps/api/**'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    // Слои бэка: Prisma только в репозиториях и коде базы в common, см. docs/backend-structure.md.
    // Сиды и тесты из apps/api/test сюда не попадают: они вне src.
    files: ['apps/api/src/**/*.ts'],
    ignores: [
      'apps/api/src/**/*.repository.ts',
      'apps/api/src/**/*.test.ts',
      'apps/api/src/common/db.ts',
      'apps/api/src/common/db-errors.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@prisma/|(^|/)generated/prisma(/|$)',
              message: 'Prisma is used only in repositories, see docs/backend-structure.md',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Архитектура фронта: импорты только из разрешённых слоёв, имена файлов и папок в kebab-case
    files: ['apps/web/src/**/*.{ts,tsx}'],
    plugins: { boundaries, 'check-file': checkFile },
    settings: {
      // eslint запускают и из apps/web (turbo), и из корня (lint-staged): пути считаем от корня репозитория
      'boundaries/root-path': import.meta.dirname,
      'boundaries/elements': Object.keys(WEB_LAYERS).map((layer) => ({
        type: layer,
        pattern: `apps/web/src/${layer}/*`,
      })),
      'import/resolver': {
        typescript: { project: `${import.meta.dirname}/apps/web/tsconfig.app.json` },
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: Object.entries(WEB_LAYERS).map(([from, allowed]) => ({
            from: { element: { type: from } },
            allow: { to: { element: { types: allowed } } },
          })),
        },
      ],
      // check-file считает пути от папки, где запущен eslint, поэтому шаблоны начинаются с **/
      'check-file/filename-naming-convention': [
        'error',
        { '**/src/**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { '**/src/**/': 'KEBAB_CASE' }],
    },
  },
  {
    // Компоненты shadcn экспортируют рядом с компонентом и его варианты (buttonVariants).
    // Fast refresh в таких файлах перезагружает страницу целиком, это не страшно.
    files: ['apps/web/src/shared/ui/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  prettier,
);
