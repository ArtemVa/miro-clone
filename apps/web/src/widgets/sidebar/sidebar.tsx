import { MenuIcon } from 'lucide-react';

import { ThemeSwitch } from '@/widgets/theme-switch';
import { Button } from '@/shared/ui/primitives/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/primitives/sheet';

import { useSidebarFacade } from './model/use-sidebar-facade';
import { SidebarContent } from './ui/sidebar-content';

// TODO: Отрефакторить компонент
export const Sidebar = () => {
  const sidebar = useSidebarFacade();

  return (
    <>
      {/* Телефон и планшет: шапка с кнопкой меню, панель — шторкой слева */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon-sm" aria-label="Открыть меню" onClick={() => sidebar.setIsMobileOpen(true)}>
          <MenuIcon />
        </Button>
        <span className="truncate text-sm font-medium">{sidebar.workspace?.name}</span>
        <div className="ml-auto">
          <ThemeSwitch />
        </div>
      </header>

      <Sheet open={sidebar.isMobileOpen} onOpenChange={sidebar.setIsMobileOpen}>
        <SheetContent side="left" className="w-64 gap-0 p-0 sm:max-w-64" showCloseButton={false}>
          <SheetTitle className="sr-only">Меню</SheetTitle>
          <SheetDescription className="sr-only">Пространство, разделы досок и меню пользователя</SheetDescription>
          <SidebarContent {...sidebar} />
        </SheetContent>
      </Sheet>

      {/* Десктоп: панель всегда видна */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
        <SidebarContent {...sidebar} />
      </aside>
    </>
  );
};
