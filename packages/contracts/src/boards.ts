import { z } from 'zod';
import { WorkspaceRoleSchema } from './workspaces';

// Роль на отдельной доске: доступ для тех, кто не состоит в пространстве (например, по ссылке).
// Владельца у доски нет, доской управляют владельцы пространства.
export const BoardRoleSchema = WorkspaceRoleSchema.exclude(['owner']);
export type BoardRole = z.infer<typeof BoardRoleSchema>;

export const BoardSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  title: z.string().trim().min(1).max(100),
  // id пользователя, который создал доску
  createdBy: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Board = z.infer<typeof BoardSchema>;
