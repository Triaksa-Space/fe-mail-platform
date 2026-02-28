"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll", "click"] as const;

/**
 * Sends a heartbeat ping to the backend every 5 minutes, but ONLY when:
 * 1. The user has shown real activity (mouse, keyboard, scroll, click) since the last ping.
 * 2. The browser tab is visible (not minimized or in background).
 *
 * On tab hide → interval is paused. On tab show → interval resumes.
 * On logout (token cleared) → everything is cleaned up.
 */
export function useHeartbeat() {
  const token = useAuthStore((state) => state.token);
  const isActiveRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) return;

    const markActive = () => {
      isActiveRef.current = true;
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, markActive, { passive: true });
    });

    const sendPing = () => {
      if (!isActiveRef.current || document.visibilityState !== "visible") return;
      isActiveRef.current = false;
      apiClient.post("/heartbeat").catch(() => {
        // Fire-and-forget — not critical if it fails
      });
    };

    const startInterval = () => {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);
      }
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopInterval();
      } else {
        startInterval();
      }
    };

    // Only start if tab is currently visible
    if (document.visibilityState === "visible") {
      startInterval();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, markActive);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopInterval();
    };
  }, [token]);
}
