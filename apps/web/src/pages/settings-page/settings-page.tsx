import { UserInfo } from '@/entities/user';
import { authStore, authStoreSelectors } from '@/core/auth';
import { ROUTES } from '@/shared/routes';
import { UiCard } from '@/shared/ui/composables/ui-card';
import { Show } from '@/shared/ui/control-flow/show';

const { SECTIONS } = ROUTES.SETTINGS;

export const SettingsPage = () => {
  const user = authStore.use(authStoreSelectors.user);

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>

      <UiCard id={SECTIONS.PROFILE} title="Профиль" description="Данные аккаунта из GET /api/auth/me">
        <Show when={!!user} data={user}>
          {(user) => <UserInfo user={user} />}
        </Show>
      </UiCard>

      <UiCard
        id={SECTIONS.NOTIFICATIONS}
        title="Уведомления"
        description="Упоминания, комментарии и приглашения на почту. Скоро."
      />
      <UiCard
        id={SECTIONS.TELEGRAM}
        title="Telegram-бот"
        description="Уведомления и быстрые заметки на доску из Telegram. Скоро."
      />
    </div>
  );
};
