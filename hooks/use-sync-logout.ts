"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Hook that syncs logout across browser tabs.
 * Listens for storage events on the auth-storage key —
 * when another tab clears it (logout), this tab also logs out.
 */
export function useSyncLogout() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // When auth-storage is removed or cleared in another tab
      if (event.key === "auth-storage" && event.newValue === null) {
        // Clear zustand state without triggering another storage event loop
        useAuthStore.setState({
          token: null,
          refreshToken: null,
          email: null,
          roleId: null,
          permissions: [],
          rememberMe: true,
        });
        window.location.replace("/");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token]);
}
