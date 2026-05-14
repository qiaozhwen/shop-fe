import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, SsoProvider, TokenPair } from '@/types/auth';

export interface BindPending {
  bindToken: string;
  bindTokenExpiresAt: number;
  provider: SsoProvider;
  profile: { nickname?: string; avatarUrl?: string };
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;   // epoch ms
  subject: Subject | null;
  bindPending: BindPending | null;

  setTokens: (tokens: TokenPair, subject: Subject) => void;
  setSubject: (subject: Subject) => void;
  setBindPending: (
    bindToken: string,
    bindTokenExpiresIn: number,
    provider: SsoProvider,
    profile: { nickname?: string; avatarUrl?: string },
  ) => void;
  clearBindPending: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      subject: null,
      bindPending: null,

      setTokens: (tokens, subject) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenExpiresAt: Date.now() + tokens.accessTokenExpiresIn * 1000,
          subject,
          bindPending: null,
        }),
      setSubject: (subject) => set({ subject }),
      setBindPending: (bindToken, expiresIn, provider, profile) =>
        set({
          bindPending: {
            bindToken,
            bindTokenExpiresAt: Date.now() + expiresIn * 1000,
            provider,
            profile,
          },
        }),
      clearBindPending: () => set({ bindPending: null }),
      clear: () =>
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          subject: null,
          bindPending: null,
        }),
    }),
    { name: 'qz-shop-auth' },
  ),
);
