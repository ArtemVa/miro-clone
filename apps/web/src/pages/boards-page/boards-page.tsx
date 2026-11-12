import { LayoutGridIcon, PlusIcon } from 'lucide-react';

import { EmptyState } from '@/shared/ui/composables/empty-state';
import { Button } from '@/shared/ui/primitives/button/button';

export const BoardsPage = () => (
  <div className="flex flex-col gap-6 p-6">
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Доски</h1>
      <Button disabled>
        <PlusIcon />
        Новая доска
      </Button>
    </div>

    <EmptyState
      icon={<LayoutGridIcon />}
      title="Здесь появятся ваши доски"
      description="Создайте первую доску, чтобы начать работу с командой."
      className="rounded-xl border border-dashed py-16"
    />
  </div>
);
