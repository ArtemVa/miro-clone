import type { Decorator, Preview } from '@storybook/react-vite';

import { TooltipProvider } from '../src/shared/ui/primitives/tooltip';

import '../src/app/styles/index.css';

/** Тема переключается в тулбаре Storybook: тот же класс .dark на <html>, что и в приложении */
const withTheme: Decorator = (Story, { globals }) => {
  document.documentElement.classList.toggle('dark', globals.theme === 'dark');
  return <Story />;
};

/** Как в App: подсказкам нужен общий провайдер */
const withTooltipProvider: Decorator = (Story) => (
  <TooltipProvider delayDuration={300}>
    <Story />
  </TooltipProvider>
);

const preview: Preview = {
  decorators: [withTheme, withTooltipProvider],
  globalTypes: {
    theme: {
      description: 'Тема',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Светлая' },
          { value: 'dark', title: 'Тёмная' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'centered',
  },
};

export default preview;
