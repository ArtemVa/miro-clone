import { Link, Outlet } from 'react-router';

import { ThemeSwitch } from '@/widgets/theme-switch';
import { ROUTES } from '@/shared/routes';
import { Logo } from '@/shared/ui/composables/logo';
import { StickyNote } from '@/shared/ui/composables/sticky-note';

const VISUAL_STICKERS = [
  { text: 'Релиз без хотфиксов', color: 'green' },
  { text: 'Быстрые код-ревью', color: 'green' },
  { text: 'Долго ждали дизайн', color: 'pink' },
  { text: 'Флаки-тесты в CI', color: 'pink' },
  { text: 'Парное программирование по пятницам', color: 'blue' },
  { text: 'Тест-дни раз в спринт', color: 'purple' },
] as const;

export const AuthLayout = () => (
  <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    <div className="flex flex-col px-4 py-6 sm:px-10">
      <div className="flex items-center justify-between">
        <Link to={ROUTES.LANDING.path}>
          <Logo />
        </Link>
        <ThemeSwitch />
      </div>

      <main className="mx-auto flex w-full max-w-95 flex-1 flex-col justify-center py-10">
        <Outlet />
      </main>
    </div>

    <aside className="canvas-dots relative hidden overflow-hidden border-l lg:block" aria-hidden="true">
      <div className="absolute top-[16%] left-[12%] w-[76%]">
        <p className="text-xl font-semibold tracking-tight">Ретро спринта 42</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {VISUAL_STICKERS.map(({ text, color }) => (
            <StickyNote key={text} color={color} className="aspect-square">
              {text}
            </StickyNote>
          ))}
        </div>
      </div>
    </aside>
  </div>
);
