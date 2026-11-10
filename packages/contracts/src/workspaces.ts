import { z } from 'zod';
import { UserSchema } from './users';

// Роли в пространстве. Что можно каждой роли: docs/permissions.md
export const WorkspaceRoleSchema = z.enum(['owner', 'editor', 'viewer']);
export type WorkspaceRole = z.infer<typeof WorkspaceRoleSchema>;

export const WorkspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(100),
  createdAt: z.iso.datetime(),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const WorkspaceMemberSchema = z.object({
  user: UserSchema.pick({ id: true, name: true, email: true }),
  role: WorkspaceRoleSchema,
  // Когда пользователя добавили в пространство
  createdAt: z.iso.datetime(),
});
export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;
