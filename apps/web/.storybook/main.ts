import type { StorybookConfig } from '@storybook/react-vite';

// Сборка берёт vite.config.ts приложения: те же алиасы, Tailwind и проверка env
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
};

export default config;
