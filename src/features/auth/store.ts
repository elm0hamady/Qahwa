import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  isAuthenticated: boolean;
  setTokens: (tokens: { access: string; refresh: string }) => void;
  setAccessToken: (access: string) => void;
  setUsername: (username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      username: null,
      isAuthenticated: false,
      setTokens: ({ access, refresh }) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      setAccessToken: (access) => set({ accessToken: access }),
      setUsername: (username) => set({ username }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, username: null, isAuthenticated: false }),
    }),
    {
      name: "qahwa-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
