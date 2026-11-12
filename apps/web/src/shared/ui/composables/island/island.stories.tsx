import type { Meta, StoryObj } from '@storybook/react-vite';
import { HandIcon, MousePointer2Icon, SparklesIcon, StickyNoteIcon, TypeIcon } from 'lucide-react';

import { Button } from '../../primitives/button/button';
import { Island } from '../island';

const meta = {
  title: 'Composables/Island',
  component: Island,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="canvas-dots grid h-80 place-items-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Island>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Тулбар доски: острова плавают над холстом */
export const Toolbar: Story = {
  render: () => (
    <Island>
      <Button variant="ghost" size="icon-sm" aria-label="Выделение">
        <MousePointer2Icon />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Рука">
        <HandIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Стикер">
        <StickyNoteIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Текст">
        <TypeIcon />
      </Button>
      <Button variant="ai-soft" size="sm">
        <SparklesIcon />
        ИИ
      </Button>
    </Island>
  ),
};
