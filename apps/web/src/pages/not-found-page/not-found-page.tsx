import { useNavigate } from 'react-router';

import { ROUTES } from '@/shared/routes';
import { ErrorPageElement } from '@/shared/ui/errors/error-page-element';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <ErrorPageElement
      title="Страница не найдена"
      description="Такой страницы не существует или она была перемещена."
      onGoHome={() => void navigate(ROUTES.LANDING.path)}
    />
  );
};
