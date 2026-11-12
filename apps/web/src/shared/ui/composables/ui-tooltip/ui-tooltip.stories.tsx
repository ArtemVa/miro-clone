import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from 'lucide-react';

import { Button } from '../../primitives/button';
import { UiTooltip } from './ui-tooltip';

const meta = {
  title: 'Composables/UiTooltip',
  component: UiTooltip,
  args: {
    triggerSlot: (
      <Button variant="outline" size="icon" aria-label="Новая доска">
        <PlusIcon />
      </Button>
    ),
    children: 'Новая доска',
  },
} satisfies Meta<typeof UiTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sides: Story = {
  render: (args) => (
    <div className="flex gap-4">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <UiTooltip key={side} {...args} side={side} triggerSlot={<Button variant="outline">{side}</Button>}>
          Подсказка: {side}
        </UiTooltip>
      ))}
    </div>
  ),
};
