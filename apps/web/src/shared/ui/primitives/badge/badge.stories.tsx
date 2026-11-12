import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '.';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  args: { children: 'Черновик' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'primary', 'ai', 'success', 'warning', 'destructive'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Черновик</Badge>
      <Badge variant="outline">Архив</Badge>
      <Badge variant="primary">Новое</Badge>
      <Badge variant="ai">ИИ</Badge>
      <Badge variant="success">Онлайн</Badge>
      <Badge variant="warning">Скоро истечёт</Badge>
      <Badge variant="destructive">Ошибка</Badge>
    </div>
  ),
};
