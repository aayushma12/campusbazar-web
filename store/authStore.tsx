import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  phoneNumber?: string;
  studentId?: string;
  batch?: string;
  collegeId?: string;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setAccessToken: (token) =>
        set({
          accessToken: token,
          isAuthenticated: true,
        }),

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      isAdmin: () => {
        const state = get();
        return state.user?.role === "admin";
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Sync to cookie on hydration if state exists
        if (typeof document !== 'undefined') {
          if (state?.isAuthenticated) {
            const cookieValue = encodeURIComponent(JSON.stringify({ state }));
            document.cookie = `auth-storage=${cookieValue}; path=/; max-age=2592000; samesite=lax`;
          } else {
            document.cookie = `auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        }
      },
    }
  )
);

// Helper to manually sync to cookie when state changes
if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state) => {
    if (state.isAuthenticated) {
      const cookieValue = encodeURIComponent(JSON.stringify({ state }));
      document.cookie = `auth-storage=${cookieValue}; path=/; max-age=2592000; samesite=lax`;
    } else {
      document.cookie = `auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });
}

