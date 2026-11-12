import { Outlet } from 'react-router';

import { Header } from '@/widgets/header';

export const LandingLayout = () => (
  <div className="flex min-h-dvh flex-col">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);
