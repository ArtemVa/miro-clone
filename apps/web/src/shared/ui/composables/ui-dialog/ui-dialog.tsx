import type { ComponentProps, ReactNode } from 'react';

import type { Simplify } from '@/shared/lib/types/common';
import { Show } from '@/shared/ui/control-flow/show';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/primitives/dialog';

type UiDialogProps = Simplify<
  {
    /** Кнопка, которая открывает диалог. Без неё диалог управляется через open/onOpenChange */
    trigger?: ReactNode;
    /** Обязателен: по нему скринридер объявляет диалог */
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    /** Кнопки действий. Закрыть из кнопки — обернуть её в DialogClose или поменять open */
    footer?: ReactNode;
    className?: string;
    showCloseButton?: boolean;
  } & Pick<ComponentProps<typeof Dialog>, 'open' | 'defaultOpen' | 'onOpenChange'>
>;

export const UiDialog = ({
  trigger,
  title,
  description,
  children,
  footer,
  className,
  showCloseButton,
  ...rootProps
}: UiDialogProps) => (
  <Dialog {...rootProps}>
    <Show when={!!trigger}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
    </Show>

    {/* Без описания radix ждёт явный aria-describedby={undefined}, иначе предупреждает в консоли */}
    <DialogContent
      className={className}
      showCloseButton={showCloseButton}
      {...(description ? {} : { 'aria-describedby': undefined })}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <Show when={!!description}>
          <DialogDescription>{description}</DialogDescription>
        </Show>
      </DialogHeader>

      {children}

      <Show when={!!footer}>
        <DialogFooter>{footer}</DialogFooter>
      </Show>
    </DialogContent>
  </Dialog>
);
