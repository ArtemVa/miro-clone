import type { Meta, StoryObj } from '@storybook/react-vite';

import { STICKY_COLORS } from '../../../config/board';
import { StickyNote } from './sticky-note';

const meta = {
  title: 'Composables/StickyNote',
  component: StickyNote,
  args: {
    color: 'yellow',
    children: 'Релиз без хотфиксов',
    className: 'aspect-square w-40',
  },
  argTypes: {
    color: { control: 'select', options: STICKY_COLORS },
  },
  decorators: [
    (Story) => (
      <div className="canvas-dots p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StickyNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Все цвета палитры из handoff */
export const Palette: Story = {
  render: (args) => (
    <div className="grid grid-cols-4 gap-4">
      {STICKY_COLORS.map((color) => (
        <StickyNote key={color} {...args} color={color}>
          {color}
        </StickyNote>
      ))}
    </div>
  ),
};
