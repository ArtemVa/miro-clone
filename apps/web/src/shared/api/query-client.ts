import { QueryClient } from '@tanstack/react-query';

import { getApiErrorStatus } from './http-client';

const MAX_RETRIES = 2;

// Мутации по умолчанию не повторяются (retry: 0), отдельная настройка для них не нужна
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30 секунд данные свежие: повторный useQuery, фокус окна и переподключение сети их не перезапрашивают.
      // refetchOnWindowFocus оставлен включённым (по умолчанию): после возврата во вкладку устаревший список досок обновится.
      // Данные, которые обновляет сокет (содержимое доски), получат staleTime: Infinity в своём useQuery
      staleTime: 30_000,
      // 4xx повторять бессмысленно (ошибка не исчезнет), 401 обновляет auth-интерцептор
      retry: (failureCount, error) => {
        const status = getApiErrorStatus(error);
        return (status === undefined || status >= 500) && failureCount < MAX_RETRIES;
      },
    },
  },
});
