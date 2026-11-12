import type { Simplify } from '@/shared/lib/types/common';

import type { LoginInput, RegisterInput, Session } from '../model/auth.types';

export type AuthStoreSlice = Simplify<AuthState & AuthActions>;

export type AuthState = {
  session: Session | null;
};

export type AuthActions = {
  actions: {
    signIn: (input: LoginInput) => Promise<void>;
    register: (input: RegisterInput) => Promise<void>;
    signOut: () => Promise<void>;
    restoreSession: () => Promise<void>;
    refreshToken: () => Promise<string>;
    clearSession: () => void;
  };
};
