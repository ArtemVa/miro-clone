import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  clean: true,
  sourcemap: true,
  // @repo/contracts отдаёт сырые .ts без сборки — Node их не запустит,
  // поэтому вшиваем contracts прямо в бандл. Остальные зависимости остаются внешними.
  noExternal: ['@repo/contracts'],
});
