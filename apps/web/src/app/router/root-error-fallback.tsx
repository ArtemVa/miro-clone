import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useRouteError } from 'react-router';

import { reportError } from '@/shared/lib/helpers/sentry-monitoring';
import { ROUTES } from '@/shared/routes';
import { ErrorPageElement } from '@/shared/ui/errors/error-page-element';

export const RootErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <ErrorPageElement
      title="Что-то пошло не так"
      description="Попробуйте обновить страницу."
      onRetry={resetErrorBoundary}
      onGoHome={() => window.location.assign(ROUTES.LANDING.path)}
    />
  );
};

export const RouteErrorFallback = () => {
  const error = useRouteError();

  return <RootErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
};
