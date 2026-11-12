import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initMonitoring } from '@/shared/lib/helpers/sentry-monitoring';

import { App } from './app';

import './styles/index.css';

const enableMocking = async () => {
  // Проверка import.meta.env статическая: в сборке без моков MSW не попадёт в бандл
  if (import.meta.env.VITE_APP_API_MOCKS !== 'true') {
    return;
  }

  const { startMockWorker } = await import('@/mocks/browser');
  await startMockWorker();
};

// Мониторинг не должен мешать запуску: если SDK не загрузился, приложение работает без него
void Promise.all([enableMocking(), initMonitoring().catch(() => undefined)]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
