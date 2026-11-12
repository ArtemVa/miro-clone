/* ----- MODEL FOR FRONTEND ----- */

export type User = {
  id: string;
  name: string;
  email: string;
  /** ISO-строка: модель лежит в сессии в localStorage, Date туда не сериализуется */
  createdAt: string;
};
