import { persist } from 'zustand/middleware';

import { createStore } from '@/shared/lib/helpers/create-store';

import { SESSION_STORAGE_KEY } from '../model/auth.constants';
import { authModel } from '../model/auth.model';
import { authService } from '../service/auth.service';
import type { AuthStoreSlice } from './auth.store-types';

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
          set({ session: null });
        },

        restoreSession: async () => {
          if (!get().session) return;

          const user = await authService.getMe();
          set((state) => (state.session ? { session: { ...state.session, user } } : state));
        },

        refreshToken: async () => {
          const accessToken = await authService.refreshToken();
          set((state) => (state.session ? { session: { ...state.session, accessToken } } : state));

          return accessToken;
        },

        clearSession: () => set({ session: null }),
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
