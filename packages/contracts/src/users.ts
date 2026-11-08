import { z } from 'zod';
import { PaginationQuerySchema, paginated, SortOrderSchema } from './lists';

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  createdAt: z.iso.datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const UserListQuerySchema = PaginationQuerySchema.extend({
  sort: z.enum(['createdAt', 'name']).default('createdAt'),
  order: SortOrderSchema.default('desc'),
});
export type UserListQuery = z.infer<typeof UserListQuerySchema>;

export const UserListSchema = paginated(UserSchema);
export type UserList = z.infer<typeof UserListSchema>;

export const CreateUserBodySchema = UserSchema.pick({ name: true, email: true });
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
