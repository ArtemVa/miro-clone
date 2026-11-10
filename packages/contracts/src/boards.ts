import { z } from 'zod';

// Роль на отдельной доске. Даёт доступ к одной доске тому, кто не состоит в пространстве (например, по ссылке),
// или повышает роль на этой доске участнику пространства. Владельца у доски нет, доской управляют владельцы пространства.
export const BoardRoleSchema = z.enum(['editor', 'viewer']);
export type BoardRole = z.infer<typeof BoardRoleSchema>;

export const BoardSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  title: z.string().trim().min(1).max(100),
  createdById: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Board = z.infer<typeof BoardSchema>;
