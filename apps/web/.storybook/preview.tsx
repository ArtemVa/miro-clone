import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/app/styles/index.css';

/** Тема переключается в тулбаре Storybook: тот же класс .dark на <html>, что и в приложении */
const withTheme: Decorator = (Story, { globals }) => {
  document.documentElement.classList.toggle('dark', globals.theme === 'dark');
  return <Story />;
};

const preview: Preview = {
  decorators: [withTheme],
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
