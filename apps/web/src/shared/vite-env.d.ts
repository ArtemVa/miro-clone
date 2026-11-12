/// <reference types="vite/client" />

// Все переменные необязательные: значения по умолчанию задаёт env-schema.ts
interface ImportMetaEnv {
  readonly VITE_APP_DOMAIN?: string;
  readonly VITE_APP_API_URL?: string;
  readonly VITE_APP_API_MOCKS?: 'true' | 'false';
  readonly VITE_APP_API_PROXY_TARGET?: string;
  readonly VITE_APP_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
