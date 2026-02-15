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

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Get tokens from storage
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

// Request interceptor - add auth header
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

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for login or refresh endpoints
      if (
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/token/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request while refreshing
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

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/token/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        setTokens(access_token, newRefreshToken);
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
