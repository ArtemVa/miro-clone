/// <reference types="vitest/config" />
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { z } from 'zod';

import { envVariablesSchema } from './src/shared/config/env/env-schema.ts';

/** В клиентский бандл попадают только переменные с этим префиксом */
const ENV_PREFIX = 'VITE_APP_';

/** Fail fast: кривой .env роняет dev и build сразу, а не белым экраном в браузере */
const parseEnv = (env: Record<string, string>) => {
  const result = envVariablesSchema.safeParse(env);

  if (!result.success) {
    throw new Error(`Некорректные переменные окружения:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
};

export default defineConfig(({ mode }) => {
  const env = parseEnv(loadEnv(mode, import.meta.dirname, ENV_PREFIX));

  return {
    envPrefix: ENV_PREFIX,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      proxy: {
        [env.VITE_APP_API_URL]: env.VITE_APP_API_PROXY_TARGET,
        '/ws': { target: env.VITE_APP_API_PROXY_TARGET, ws: true },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/shared/lib/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
