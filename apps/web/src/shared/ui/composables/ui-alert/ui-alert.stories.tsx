import type { Meta, StoryObj } from '@storybook/react-vite';

import { UiAlert } from './ui-alert';

const meta = {
  title: 'Composables/UiAlert',
  component: UiAlert,
  args: {
    description: 'Ссылка для сброса пароля действует 30 минут.',
  },
} satisfies Meta<typeof UiAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Ошибка формы над полями */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    description: 'Неверный email или пароль',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Доска только для чтения',
    description: 'Попросите владельца выдать права редактора.',
  },
};
