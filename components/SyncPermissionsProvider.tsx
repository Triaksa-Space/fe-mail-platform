"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";

export default function SyncPermissionsProvider() {
  const token = useAuthStore((s) => s.token);
  const roleId = useAuthStore((s) => s.roleId);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const isFetching = useRef(false);

  const syncPermissions = async () => {
    if (!token || roleId !== 2 || isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await apiClient.get("/user/get_user_me");
      const perms: string[] = res.data.permissions || [];
      setPermissions(perms);
    } catch {
      // Silently ignore — 401 will be handled by the interceptor
    } finally {
      isFetching.current = false;
    }
  };

  // Sync on mount (covers page reload)
  useEffect(() => {
    syncPermissions();
  }, [token]);

  // Sync when tab regains focus (covers switching back from another tab)
  useEffect(() => {
    const handleFocus = () => syncPermissions();
    document.addEventListener("visibilitychange", handleFocus);
    return () => document.removeEventListener("visibilitychange", handleFocus);
  }, [token]);

  return null;
}
