import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
  roleId: number | null;
  rememberMe: boolean;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setEmail: (email: string | null) => void;
  setRoleId: (roleId: number | null) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setAuth: (data: {
    token: string;
    refreshToken: string;
    email: string;
    roleId: number;
    rememberMe: boolean;
  }) => void;
  logout: () => void;
  getStoredToken: () => string | null;
  getStoredRefreshToken: () => string | null;
  getStoredEmail: () => string | null;
  getStoredRoleID: () => number | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      email: null,
      roleId: null,
      rememberMe: true,
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setEmail: (email) => set({ email }),
      setRoleId: (roleId) => set({ roleId }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      setAuth: (data) =>
        set({
          token: data.token,
          refreshToken: data.refreshToken,
          email: data.email,
          roleId: data.roleId,
          rememberMe: data.rememberMe,
        }),
      logout: () => {
        // Clear zustand state
        set({
          token: null,
          refreshToken: null,
          email: null,
          roleId: null,
          rememberMe: true,
        });

        // Clear storage
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("auth-storage");
          window.localStorage.removeItem("auth-storage");
          window.location.href = "/";
        }
      },
      getStoredToken: () => {
        if (typeof window === "undefined") return null;

        // Check localStorage
        const stored = window.localStorage.getItem("auth-storage");
        if (!stored) return null;

        try {
          const parsed = JSON.parse(stored);
          return parsed.state?.token || null;
        } catch {
          return null;
        }
      },
      getStoredRefreshToken: () => {
        if (typeof window === "undefined") return null;

        const stored = window.localStorage.getItem("auth-storage");
        if (!stored) return null;

        try {
          const parsed = JSON.parse(stored);
          return parsed.state?.refreshToken || null;
        } catch {
          return null;
        }
      },
      getStoredEmail: () => {
        if (typeof window === "undefined") return null;

        const stored = window.localStorage.getItem("auth-storage");
        if (!stored) return null;

        try {
          const parsed = JSON.parse(stored);
          return parsed.state?.email || null;
        } catch {
          return null;
        }
      },
      getStoredRoleID: () => {
        if (typeof window === "undefined") return null;

        const stored = window.localStorage.getItem("auth-storage");
        if (!stored) return null;

        try {
          const parsed = JSON.parse(stored);
          return parsed.state?.roleId || null;
        } catch {
          return null;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        email: state.email,
        roleId: state.roleId,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
