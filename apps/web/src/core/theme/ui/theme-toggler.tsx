import { MoonIcon, SunIcon } from 'lucide-react';

import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';

import type { Theme } from '../model/theme.types';

type ThemeTogglerProps = {
  theme: Theme;
  label: string;
  onToggle: () => void;
};

export const ThemeToggler = ({ theme, label, onToggle }: ThemeTogglerProps) => {
  return (
    <Button type="button" size="icon" variant="outline" aria-label={label} title={label} onClick={onToggle}>
      <Show when={theme === 'dark'} fallback={<MoonIcon />}>
        <SunIcon />
      </Show>
    </Button>
  );
};
