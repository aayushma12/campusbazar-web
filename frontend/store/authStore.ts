import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserId, normalizeUser, type User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: unknown, accessToken: string, refreshToken?: string | null) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

function getConfiguredAdminIds(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_USER_IDS ||
    process.env.NEXT_PUBLIC_ADMIN_USER_ID ||
    '';

  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        const normalized = normalizeUser(user);
        set({
          user: normalized,
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          isAuthenticated: Boolean(accessToken && normalized),
        });
      },

      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;

        const merged = normalizeUser({ ...current, ...patch });
        set({ user: merged ?? current });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      isAdmin: () => {
        const user = get().user;
        if (!user) return false;

        if (user.role === 'admin') return true;

        const configuredAdminIds = getConfiguredAdminIds();
        const userId = getUserId(user);
        return Boolean(userId && configuredAdminIds.includes(userId));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
