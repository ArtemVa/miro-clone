import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

const worker = setupWorker(...handlers);

export const startMockWorker = () =>
  worker.start({
    // Всё, для чего нет моков (ассеты vite, HMR, сторонние API), идёт в сеть как обычно
    onUnhandledFrame: 'bypass',
  });
