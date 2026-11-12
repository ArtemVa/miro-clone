import { featureFlagsStore, featureFlagsStoreSelectors } from '@/core/feature-flags';
import { themeStore, themeStoreSelectors, ThemeToggler } from '@/core/theme';
import { Show } from '@/shared/ui/control-flow/show';

export const ThemeSwitch = () => {
  const isEnabled = featureFlagsStore.use(featureFlagsStoreSelectors.isEnabled('theme'));
  const theme = themeStore.use(themeStoreSelectors.theme);
  const { toggleTheme } = themeStore.use(themeStoreSelectors.actions);

  return (
    <Show when={isEnabled}>
      <ThemeToggler theme={theme} label="Переключить тему" onToggle={toggleTheme} />
    </Show>
  );
};
