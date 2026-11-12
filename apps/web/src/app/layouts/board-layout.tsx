import { Outlet } from 'react-router';

/** Доска на весь экран: холст без прокрутки страницы, интерфейс — плавающими островами (design/board.html) */
export const BoardLayout = () => (
  <main className="canvas-dots h-dvh overflow-hidden overscroll-none">
    <Outlet />
  </main>
);
