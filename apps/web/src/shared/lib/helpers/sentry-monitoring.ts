import { env, IS_DEV_MODE } from '@/shared/config/env/config';

type Sentry = typeof import('@sentry/react');

let sentry: Sentry | undefined;

export const initMonitoring = async () => {
  if (!env.VITE_APP_SENTRY_DSN) {
    return;
  }

  sentry = await import('@sentry/react');
  sentry.init({
    dsn: env.VITE_APP_SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
};

/** Ошибка, которую поймали сами (ErrorBoundary): в dev — в консоль, в мониторинг — если он включён */
export const reportError = (error: unknown) => {
  if (IS_DEV_MODE) {
    console.error(error);
  }

  sentry?.captureException(error);
};
