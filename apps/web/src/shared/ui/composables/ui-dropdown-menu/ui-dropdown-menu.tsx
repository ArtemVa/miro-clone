import type { ComponentProps, ReactNode } from 'react';
import { cn } from 'cn';
import { Link } from 'react-router';

import type { Simplify } from '@/shared/lib/types/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';

export type UiMenuItem =
  | {
      type?: 'item';
      label: ReactNode;
      icon?: ReactNode;
      /** Ссылка внутри приложения. Если задана, пункт рендерится как Link */
      to?: string;
      onSelect?: () => void;
      variant?: 'default' | 'destructive';
      disabled?: boolean;
    }
  | { type: 'separator' }
  | { type: 'label'; label: ReactNode };

type UiDropdownMenuProps = Simplify<
  {
    /** Должен быть фокусируемым элементом (button), чтобы меню открывалось с клавиатуры */
    trigger: ReactNode;
    items: UiMenuItem[];
    contentClassName?: string;
  } & Pick<ComponentProps<typeof DropdownMenuContent>, 'align' | 'side' | 'sideOffset'>
>;

const renderItem = (item: UiMenuItem, index: number) => {
  if (item.type === 'separator') {
    return <DropdownMenuSeparator key={index} />;
  }

  if (item.type === 'label') {
    return <DropdownMenuLabel key={index}>{item.label}</DropdownMenuLabel>;
  }

  const content = (
    <>
      {item.icon}
      {item.label}
    </>
  );

  return (
    <DropdownMenuItem
      key={index}
      asChild={!!item.to}
      variant={item.variant}
      disabled={item.disabled}
      onSelect={item.onSelect}
    >
      {item.to ? <Link to={item.to}>{content}</Link> : content}
    </DropdownMenuItem>
  );
};

export const UiDropdownMenu = ({ trigger, items, contentClassName, ...contentProps }: UiDropdownMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent className={cn('min-w-56', contentClassName)} {...contentProps}>
      {items.map(renderItem)}
    </DropdownMenuContent>
  </DropdownMenu>
);
