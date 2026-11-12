import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon, SparklesIcon } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Создать доску' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive', 'ai', 'ai-soft'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'default', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} variant="default" />
      <Button {...args} variant="secondary" />
      <Button {...args} variant="outline" />
      <Button {...args} variant="ghost" />
      <Button {...args} variant="destructive" />
    </div>
  ),
};

/** Фиолетовый только для ИИ-действий */
export const Ai: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="ai">
        <SparklesIcon />
        Сгенерировать
      </Button>
      <Button variant="ai-soft">
        <SparklesIcon />
        Спросить ИИ
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PlusIcon />
        Новая доска
      </>
    ),
  },
};
