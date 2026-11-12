import { persist } from 'zustand/middleware';

import { queryClient } from '@/shared/api/query-client';
import { createStore } from '@/shared/lib/helpers/create-store';

import { SESSION_STORAGE_KEY } from '../model/auth.constants';
import { authModel } from '../model/auth.model';
import { authService } from '../service/auth.service';
import type { AuthStoreSlice } from './auth.store-types';

/** Идущая проверка сессии: повторный вызов (StrictMode монтирует эффекты дважды) ждёт её, а не шлёт второй refresh с той же cookie */
let restoreSessionPromise: Promise<void> | null = null;

export const authStore = createStore<AuthStoreSlice>()(
  persist(
    (set, get) => ({
      session: null,
      actions: {
        signIn: async (input) => {
          set({ session: await authService.signIn(input) });
        },

        register: async (input) => {
          set({ session: await authService.register(input) });
        },

        signOut: async () => {
          await authService.signOut();
          get().actions.clearSession();
        },

        // Залогинен ли пользователь, решает сервер: свою сессию проверяем через /me, а без неё refresh-cookie ещё может быть жива
        restoreSession: () => {
          restoreSessionPromise ??= (async () => {
            if (!get().session) {
              const session = await authService.restoreSessionByCookie();
              set((state) => (state.session ? state : { session }));
              return;
            }

            const user = await authService.getMe();
            set((state) => (state.session ? { session: { ...state.session, user } } : state));
          })().finally(() => {
            restoreSessionPromise = null;
          });

          return restoreSessionPromise;
        },

        refreshToken: async () => {
          const accessToken = await authService.refreshToken();
          set((state) => (state.session ? { session: { ...state.session, accessToken } } : state));

          return accessToken;
        },

        // И при выходе, и при протухшей сессии: кэш запросов принадлежит прошлому пользователю, следующему он показываться не должен
        clearSession: () => {
          set({ session: null });
          queryClient.clear();
        },
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      partialize: (state) => ({ session: state.session }),
      merge: (persisted, current) => ({
        ...current,
        session: authModel.getPersistedSession(persisted),
      }),
    },
  ),
);
