import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../primitives/button';
import { UiCard } from './ui-card';

const meta = {
  title: 'Composables/UiCard',
  component: UiCard,
  args: {
    title: 'Профиль',
    description: 'Имя и email видят участники пространства',
    children: 'Содержимое карточки',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UiCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActionAndFooter: Story = {
  args: {
    action: (
      <Button variant="outline" size="sm">
        Изменить
      </Button>
    ),
    footer: <Button>Сохранить</Button>,
  },
};
