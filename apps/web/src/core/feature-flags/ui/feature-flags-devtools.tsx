import { CogIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/primitives/dialog';

import { FEATURE_FLAG_NAMES } from '../model/feature-flags.constants';
import { featureFlagsModel } from '../model/feature-flags.model';
import { featureFlagsStore } from '../store/feature-flags.store';
import { featureFlagsStoreSelectors } from '../store/feature-flags.store-selectors';

/** Панель для разработчиков и тестировщиков: локальное переключение фича-флагов (только dev) */
export const FeatureFlagsDevtools = () => {
  const featureFlags = featureFlagsStore.use(useShallow(featureFlagsStoreSelectors.featureFlags));
  const { resetOverrides, toggleOverride } = featureFlagsStore.use(featureFlagsStoreSelectors.actions);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Открыть devtools"
          title="Открыть devtools"
          className="fixed right-3 bottom-18 z-50 size-11 rounded-full bg-background/95 shadow-lg backdrop-blur"
        >
          <CogIcon className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Фича-флаги</DialogTitle>
          <DialogDescription>
            Локальные значения хранятся в localStorage и важнее значений с сервера. Работает только в dev.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {FEATURE_FLAG_NAMES.map((name) => (
            <label key={name} className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3">
              <span className="flex items-center gap-2 font-medium">
                {name}
                <Show when={featureFlagsModel.isOverridden(featureFlags, name)}>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">локально</span>
                </Show>
              </span>

              <Checkbox
                aria-label={name}
                checked={featureFlagsModel.isEnabled(featureFlags, name)}
                onCheckedChange={() => toggleOverride(name)}
              />
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={!featureFlagsModel.hasOverrides(featureFlags)}
            onClick={resetOverrides}
          >
            Сбросить к серверным значениям
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
