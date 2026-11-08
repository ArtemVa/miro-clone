// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Один конфиг на весь репозиторий. `eslint .` внутри пакета находит его, поднимаясь по папкам вверх.
export default defineConfig(
  { ignores: ['**/dist/**', '**/coverage/**', '**/.turbo/**', '**/generated/**'] },
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
    // Компоненты shadcn экспортируют рядом с компонентом и его варианты (buttonVariants).
    // Fast refresh в таких файлах перезагружает страницу целиком, это не страшно.
    files: ['apps/web/src/shared/ui/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  prettier,
);
