import { Outlet } from 'react-router';

import { Sidebar } from '@/widgets/sidebar';

/** Сайдбар слева на десктопе, шапка с меню-шторкой на телефоне. Прокручивается только main */
export const AppLayout = () => (
  <div className="flex h-dvh flex-col lg:flex-row">
    <Sidebar />
    <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);
