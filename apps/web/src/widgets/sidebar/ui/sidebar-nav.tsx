import { cn } from 'cn';
import { Link } from 'react-router';

import { boardsViewPath, type BoardsView, type SidebarNavItem } from '../model/constants';

const ITEM_CLASS =
  'flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors [&_svg]:size-4';

type SidebarNavEntryProps = {
  item: SidebarNavItem;
  activeView: BoardsView | null;
};

const SidebarNavEntry = ({ item, activeView }: SidebarNavEntryProps) => {
  if (!('view' in item)) {
    return (
      <span aria-disabled="true" title="Скоро" className={cn(ITEM_CLASS, 'cursor-not-allowed opacity-50')}>
        <item.icon />
        {item.label}
      </span>
    );
  }

  return (
    <Link
      to={boardsViewPath(item.view)}
      aria-current={item.view === activeView ? 'page' : undefined}
      className={cn(
        ITEM_CLASS,
        'hover:bg-accent hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground',
      )}
    >
      <item.icon />
      {item.label}
    </Link>
  );
};

type SidebarNavProps = {
  label: string;
  items: SidebarNavItem[];
  activeView: BoardsView | null;
  className?: string;
};

export const SidebarNav = ({ label, items, activeView, className }: SidebarNavProps) => (
  <nav aria-label={label} className={className}>
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.label}>
          <SidebarNavEntry item={item} activeView={activeView} />
        </li>
      ))}
    </ul>
  </nav>
);
