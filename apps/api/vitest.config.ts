import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      // Логи запросов в выводе тестов только мешают
      LOG_LEVEL: 'silent',
      // Отдельная база для тестов в том же Postgres (в CI — в сервисе postgres).
      // Перед каждым тестом её таблицы очищаются, поэтому адрес рабочей базы сюда ставить нельзя.
      DATABASE_URL: 'postgresql://app:app@localhost:5432/app_test',
    },
    globalSetup: ['test/global-setup.ts'],
    // Все файлы тестов работают с одной базой и очищают её, поэтому запускаем их по очереди
    fileParallelism: false,
  },
});
