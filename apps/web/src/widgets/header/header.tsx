import { Link } from 'react-router';

import { ThemeSwitch } from '@/widgets/theme-switch';
import { authStore, authStoreSelectors } from '@/core/auth';
import { ROUTES } from '@/shared/routes';
import { Logo } from '@/shared/ui/composables/logo';
import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';

export const Header = () => {
  const isAuthorized = authStore.use(authStoreSelectors.isAuthorized);

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to={ROUTES.LANDING.path}>
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Show
            when={isAuthorized}
            fallback={
              <>
                <Button asChild variant="ghost">
                  <Link to={ROUTES.AUTH.LOGIN.path}>Войти</Link>
                </Button>
                <Button asChild>
                  <Link to={ROUTES.AUTH.REGISTER.path}>Начать бесплатно</Link>
                </Button>
              </>
            }
          >
            <Button asChild>
              <Link to={ROUTES.BOARDS.path}>Мои доски</Link>
            </Button>
          </Show>
        </div>
      </div>
    </header>
  );
};
