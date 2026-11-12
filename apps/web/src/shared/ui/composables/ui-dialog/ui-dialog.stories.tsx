import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../primitives/button';
import { DialogClose } from '../../primitives/dialog';
import { UiDialog } from './ui-dialog';

const meta = {
  title: 'Composables/UiDialog',
  component: UiDialog,
  args: {
    trigger: <Button variant="outline">Удалить доску</Button>,
    title: 'Удалить доску?',
    description: 'Доска попадёт в корзину. Восстановить её можно в течение 30 дней.',
    footer: (
      <>
        <DialogClose asChild>
          <Button variant="outline">Отмена</Button>
        </DialogClose>
        <Button variant="destructive">Удалить</Button>
      </>
    ),
  },
} satisfies Meta<typeof UiDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: {
    description: undefined,
    children: <p className="text-sm text-muted-foreground">Произвольное содержимое диалога</p>,
  },
};
