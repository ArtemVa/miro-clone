import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyIcon, ExternalLinkIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { MemoryRouter } from 'react-router';

import { Button } from '../../primitives/button';
import { UiDropdownMenu } from './ui-dropdown-menu';

const meta = {
  title: 'Composables/UiDropdownMenu',
  component: UiDropdownMenu,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    trigger: <Button variant="outline">Действия с доской</Button>,
    align: 'start',
    items: [
      { label: 'Открыть', icon: <ExternalLinkIcon />, to: '/boards' },
      { label: 'Переименовать', icon: <PencilIcon /> },
      { label: 'Дублировать', icon: <CopyIcon /> },
      { type: 'separator' },
      { label: 'В корзину', icon: <Trash2Icon />, variant: 'destructive' },
    ],
  },
} satisfies Meta<typeof UiDropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
