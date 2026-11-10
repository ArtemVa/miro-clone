import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // В dev запросы на /api уходят в api. Для браузера фронт и api на одном адресе, поэтому CORS не нужен.
    // Порт: PORT из apps/api/.env. WebSocket api будет слушать на /ws, так же настроен nginx (apps/web/nginx.conf).
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': { target: 'http://localhost:3000', ws: true },
    },
  },
});
