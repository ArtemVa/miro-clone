// Запускается из .husky/pre-commit на файлах, добавленных в коммит.
// У .ts и остальных файлов разные шаблоны, чтобы eslint и prettier не правили один файл одновременно.
module.exports = {
  '*.{ts,tsx}': [
    // Типы проверяем один раз на весь коммит: turbo возьмёт из кэша пакеты, в которых ничего не менялось.
    () => 'pnpm turbo run typecheck --output-logs=errors-only',
    'eslint --fix',
    'prettier --write',
  ],
  '*.{js,mjs,cjs,json,md,yml,yaml,css,html}': 'prettier --write',
};
