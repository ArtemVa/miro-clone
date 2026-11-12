/**
 * Таблица мок-БД. Данные хранятся в localStorage, чтобы переживать перезагрузку страницы
 * (сессия тоже лежит в localStorage, и /auth/me после F5 должен найти пользователя).
 * Сбросить мок-БД: удалить ключи `msw:*` в localStorage.
 */
export const createCollection = <T extends { id: string }>(storageKey: string, seed: T[]) => {
  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T[]) : seed;
    } catch {
      return seed;
    }
  };

  const write = (items: T[]) => localStorage.setItem(storageKey, JSON.stringify(items));

  return {
    findAll: read,

    findById: (id: string) => read().find((item) => item.id === id),

    findOne: (predicate: (item: T) => boolean) => read().find(predicate),

    insert: (item: T) => {
      write([...read(), item]);
      return item;
    },

    update: (id: string, patch: Partial<Omit<T, 'id'>>) => {
      let updated: T | undefined;
      write(read().map((item) => (item.id === id ? (updated = { ...item, ...patch }) : item)));
      return updated;
    },

    remove: (id: string) => write(read().filter((item) => item.id !== id)),
  };
};
