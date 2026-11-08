import { z } from 'zod';

// Query-параметры любого списка: ?page=2&pageSize=20. Из URL они приходят строками, поэтому coerce.
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// Направление сортировки: ?sort=name&order=asc. Поля для sort перечисляет схема параметров конкретного списка.
export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

// Ответ любого списка. Схема для конкретного списка: export const UserListSchema = paginated(UserSchema);
export function paginated<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
  });
}
