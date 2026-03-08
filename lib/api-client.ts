import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { safeStorage } from "@/lib/safe-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Default timeout (30 seconds)
const DEFAULT_TIMEOUT = 30000;

// Create axios instance with optimized defaults
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // Optimize for JSON responses
  responseType: "json",
  // Don't transform request/response (handled by interceptors if needed)
  transformRequest: [(data, headers) => {
    // If FormData, let browser set content-type
    if (data instanceof FormData) {
      delete headers["Content-Type"];
      return data;
    }
    // Avoid double-serializing when payload is already a JSON string.
    if (typeof data === "string") {
      return data;
    }
    return JSON.stringify(data);
  }],
});

// ─── Tab-local refresh state ────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ─── Fix 1: Cross-tab refresh lock (prevents multiple tabs refreshing simultaneously) ─
const REFRESH_LOCK_KEY = "auth-refresh-lock";
const REFRESH_LOCK_TTL = 8000; // 8 seconds max for a refresh round-trip

function isAnotherTabRefreshing(): boolean {
  if (typeof window === "undefined") return false;
  const ts = Number(localStorage.getItem(REFRESH_LOCK_KEY) ?? 0);
  return Date.now() - ts < REFRESH_LOCK_TTL;
}

function acquireRefreshLock(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_LOCK_KEY, String(Date.now()));
  }
}

function releaseRefreshLock(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  }
}

// ─── Fix 1: BroadcastChannel to signal refresh result to waiting tabs ────────
type RefreshBCMessage =
  | { type: "refresh-done"; accessToken: string }
  | { type: "refresh-failed" };

const refreshBC =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("auth-refresh")
    : null;

/**
 * Waits for the currently-refreshing tab to broadcast its result.
 * Falls back to polling localStorage when BroadcastChannel is unavailable.
 */
function waitForOtherTabRefresh(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const WAIT_TIMEOUT = REFRESH_LOCK_TTL + 2000;

    if (refreshBC) {
      const timeout = setTimeout(() => {
        refreshBC.removeEventListener("message", handler);
        // On timeout, try reading the fresh token (the lock may have been released)
        const freshToken = getAccessToken();
        freshToken
          ? resolve(freshToken)
          : reject(new Error("Cross-tab token refresh timed out"));
      }, WAIT_TIMEOUT);

      const handler = (e: MessageEvent<RefreshBCMessage>) => {
        clearTimeout(timeout);
        refreshBC.removeEventListener("message", handler);
        if (e.data.type === "refresh-done") {
          resolve(e.data.accessToken);
        } else {
          // "refresh-failed" may come from a tab that *lost* the race (not a
          // genuine auth failure).  Before giving up, check whether a different
          // tab already wrote a fresh access token to storage.  If it did,
          // carry on; the next request will use the new token.  If storage is
          // truly empty the session is gone and we reject as before.
          const freshToken = getAccessToken();
          freshToken
            ? resolve(freshToken)
            : reject(new Error("Token refresh failed in another tab"));
        }
      };

      refreshBC.addEventListener("message", handler);
    } else {
      // Fallback: poll until the lock is released then read fresh token
      const pollStart = Date.now();
      const pollInterval = setInterval(() => {
        if (!isAnotherTabRefreshing()) {
          clearInterval(pollInterval);
          const freshToken = getAccessToken();
          freshToken
            ? resolve(freshToken)
            : reject(new Error("Token refresh failed in another tab"));
        } else if (Date.now() - pollStart >= WAIT_TIMEOUT) {
          clearInterval(pollInterval);
          reject(new Error("Cross-tab token refresh timed out"));
        }
      }, 200);
    }
  });
}

// ─── Token storage helpers ───────────────────────────────────────────────────
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const stored = safeStorage.getItem("auth-storage");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const stored = safeStorage.getItem("auth-storage");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.state?.refreshToken || null;
  } catch {
    return null;
  }
};

const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === "undefined") return;

  // Update localStorage directly for persistence
  const stored = safeStorage.getItem("auth-storage");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      parsed.state = {
        ...parsed.state,
        token: accessToken,
        refreshToken: refreshToken,
      };
      safeStorage.setItem("auth-storage", JSON.stringify(parsed));

      // Also update Zustand store state to keep it in sync
      useAuthStore.getState().setToken(accessToken);
      useAuthStore.getState().setRefreshToken(refreshToken);
    } catch {
      // Handle error silently
    }
  }
};

const clearTokens = () => {
  if (typeof window === "undefined") return;
  // Use Zustand's logout which handles both state and storage
  useAuthStore.getState().logout();
};

// ─── Fix 3: Token expiry helper for proactive refresh ───────────────────────
function getTokenExpiresInMs(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 - Date.now();
  } catch {
    return Infinity;
  }
}

// ─── Core refresh call (no retry) ────────────────────────────────────────────
// IMPORTANT: Do NOT retry refresh token requests on network errors.
// If the server received the request and rotated the token but the response was
// lost, retrying with the same (now-revoked) refresh token triggers the BE
// "token reuse = theft" detection which revokes ALL sessions for this user on
// every device. One-shot only; the BE grace period handles the retry side.
async function doRefresh(
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string }> {
  const response = await axios.post(`${API_BASE_URL}/token/refresh`, {
    refresh_token: refreshToken,
  });
  return response.data;
}

/**
 * Performs a token refresh with cross-tab coordination:
 * - Acquires the tab lock so other tabs wait instead of also refreshing
 * - Broadcasts the result so waiting tabs can immediately proceed
 * - Does NOT call clearTokens() — callers decide whether to logout on failure
 */
async function performRefresh(refreshToken: string): Promise<string> {
  acquireRefreshLock();
  isRefreshing = true;
  try {
    const { access_token, refresh_token: newRT } = await doRefresh(refreshToken);
    setTokens(access_token, newRT);
    processQueue(null, access_token);
    refreshBC?.postMessage({
      type: "refresh-done",
      accessToken: access_token,
    } as RefreshBCMessage);
    return access_token;
  } catch (err) {
    processQueue(err as Error, null);
    refreshBC?.postMessage({ type: "refresh-failed" } as RefreshBCMessage);
    throw err;
  } finally {
    isRefreshing = false;
    releaseRefreshLock();
  }
}

// ─── Proactive refresh timer ──────────────────────────────────────────────────
// Per-device random jitter (0–60 s) so multiple devices logged in with the same
// account do not all fire their proactive refresh at the exact same moment,
// which would race on the server's refresh-token rotation.
const _proactiveJitterMs = typeof window !== "undefined"
  ? Math.random() * 60 * 1000   // 0–60 s, fixed for this page lifetime
  : 0;

if (typeof window !== "undefined") {
  setInterval(() => {
    const token = getAccessToken();
    const rt = getRefreshToken();

    if (!token || !rt || isRefreshing || isAnotherTabRefreshing()) return;

    const expiresIn = getTokenExpiresInMs(token);
    // Refresh when expiry falls inside the jitter window (90s base + jitter).
    // Each device gets a slightly different threshold so they stagger naturally.
    const refreshThreshold = 90 * 1000 + _proactiveJitterMs; // 90s–150s before expiry
    if (expiresIn > 0 && expiresIn < refreshThreshold) {
      performRefresh(rt).catch((err) => {
        // Only logout on definitive auth errors (4xx). Network errors (no response)
        // are intentionally NOT retried — see doRefresh comment.
        const axiosErr = err as AxiosError;
        if (axiosErr.response && axiosErr.response.status < 500) {
          // ─── Race-condition guard ────────────────────────────────────────────
          // Two tabs can slip past the isAnotherTabRefreshing() check before
          // either sets the lock and both try to rotate the same refresh token.
          // The losing tab gets a 401 from /token/refresh even though the winning
          // tab already stored a fresh token in localStorage.  If the refresh
          // token has changed since we captured `rt`, we lost the race but the
          // session is still alive — do NOT clear tokens in that case.
          const currentRT = getRefreshToken();
          if (currentRT && currentRT !== rt) {
            return; // Another tab won the race — we are still authenticated.
          }
          clearTokens();
        }
      });
    }
  }, 60 * 1000);
}

// ─── Request interceptor — attach access token ───────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response interceptor — handle 401 with cross-tab refresh coordination ───
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for endpoints where 401 is a legitimate auth result, and
      // don't trigger a refresh for the heartbeat (fire-and-forget ping — the
      // proactive timer will handle any expired token on the next cycle).
      if (
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/token/refresh") ||
        originalRequest.url?.includes("/user/change_password") ||
        originalRequest.url?.includes("/heartbeat")
      ) {
        return Promise.reject(error);
      }

      // Case 1: This tab is already refreshing — queue and wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Fix 1 — Case 2: Another tab holds the refresh lock — wait for its result
      if (isAnotherTabRefreshing()) {
        try {
          const newToken = await waitForOtherTabRefresh();
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch {
          // Before logging out, check one final time: the lock-holder may have
          // succeeded (or a third tab may have won the race) and already stored
          // a fresh token while we were waiting.
          const latestToken = getAccessToken();
          const latestRT = getRefreshToken();
          if (latestToken && latestRT) {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${latestToken}`;
            return apiClient(originalRequest);
          }
          clearTokens();
          if (typeof window !== "undefined") window.location.href = "/";
          return Promise.reject(error);
        }
      }

      // Case 3: This tab will perform the refresh
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const newToken = await performRefresh(refreshToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // ─── Race-condition guard ──────────────────────────────────────────────
        // If the refresh token in localStorage has been replaced by another tab
        // since we captured `refreshToken`, we lost a cross-tab race but the
        // session is still valid.  Retry the original request with the new token
        // instead of logging out.
        const currentRT = getRefreshToken();
        if (currentRT && currentRT !== refreshToken) {
          const latestToken = getAccessToken();
          if (latestToken) {
            originalRequest.headers.Authorization = `Bearer ${latestToken}`;
            return apiClient(originalRequest);
          }
        }
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - refresh permissions then redirect
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        // Re-fetch permissions so the sidebar reflects revoked access immediately
        const failingUrl = originalRequest.url || "";
        if (!failingUrl.includes("/user/get_user_me")) {
          const token = getAccessToken();
          if (token) {
            try {
              const meResponse = await axios.get(`${API_BASE_URL}/user/get_user_me`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const newPermissions: string[] = meResponse.data.permissions || [];
              useAuthStore.getState().setPermissions(newPermissions);
            } catch {
              // Ignore — proceed with redirect regardless
            }
          }
        }
        window.location.href = "/forbidden";
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
