"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/use-toast";

const SESSION_KEY = "session-login-time";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * When "Remember Me" is OFF, force logout after 7 days from login.
 * Skipped when "Remember Me" is active — those sessions persist intentionally.
 */
export function useSessionTimeout() {
  const token = useAuthStore((state) => state.token);
  const rememberMe = useAuthStore((state) => state.rememberMe);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token || rememberMe) {
      return;
    }

    // Stamp login time if not already set
    let loginTime = Number(sessionStorage.getItem(SESSION_KEY));
    if (!loginTime) {
      loginTime = Date.now();
      sessionStorage.setItem(SESSION_KEY, String(loginTime));
    }

    const elapsed = Date.now() - loginTime;
    const remaining = SEVEN_DAYS_MS - elapsed;

    // Already expired
    if (remaining <= 0) {
      sessionStorage.removeItem(SESSION_KEY);
      toast({
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      logout();
      return;
    }

    // Schedule logout for when 7 days are up
    const timer = setTimeout(() => {
      sessionStorage.removeItem(SESSION_KEY);
      toast({
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      logout();
    }, remaining);

    return () => clearTimeout(timer);
  }, [token, rememberMe, logout]);
}
