import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Permission keys that match backend
export type PermissionKey =
  | 'overview'
  | 'user_list'
  | 'create_single'
  | 'create_bulk'
  | 'all_inbox'
  | 'all_sent'
  | 'terms_of_services'
  | 'privacy_policy'
  | 'roles_permissions';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
  roleId: number | null;
  permissions: string[];
  rememberMe: boolean;
  _hasHydrated: boolean;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setEmail: (email: string | null) => void;
  setRoleId: (roleId: number | null) => void;
  setPermissions: (permissions: string[]) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setAuth: (data: {
    token: string;
    refreshToken: string;
    email: string;
    roleId: number;
    permissions?: string[];
    rememberMe: boolean;
  }) => void;
  logout: () => void;
  getStoredToken: () => string | null;
  getStoredRefreshToken: () => string | null;
  getStoredEmail: () => string | null;
  getStoredRoleID: () => number | null;
  getStoredPermissions: () => string[];
  hasPermission: (permission: PermissionKey) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      email: null,
      roleId: null,
      permissions: [],
      rememberMe: true,
      _hasHydrated: false,
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setEmail: (email) => set({ email }),
      setRoleId: (roleId) => set({ roleId }),
      setPermissions: (permissions) => set({ permissions }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      setAuth: (data) =>
        set({
          token: data.token,
          refreshToken: data.refreshToken,
          email: data.email,
          roleId: data.roleId,
          permissions: data.permissions || [],
          rememberMe: data.rememberMe,
        }),
      logout: () => {
        // Clear zustand state
        set({
          token: null,
          refreshToken: null,
          email: null,
          roleId: null,
          permissions: [],
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
      getStoredPermissions: () => {
        if (typeof window === "undefined") return [];

        const stored = window.localStorage.getItem("auth-storage");
        if (!stored) return [];

        try {
          const parsed = JSON.parse(stored);
          return parsed.state?.permissions || [];
        } catch {
          return [];
        }
      },
      // Check if user has a specific permission
      // SuperAdmin (roleId=0) always has all permissions
      hasPermission: (permission: PermissionKey) => {
        const state = get();
        // SuperAdmin bypasses all permission checks
        if (state.roleId === 0) return true;
        // Check if permission exists in array
        return state.permissions.includes(permission);
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
        permissions: state.permissions,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
