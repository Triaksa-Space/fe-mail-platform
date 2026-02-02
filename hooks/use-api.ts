import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { AxiosRequestConfig, AxiosError } from "axios";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_CACHE_TIME = 30000; // 30 seconds
const pendingRequests = new Map<string, Promise<unknown>>();

interface UseApiOptions<T> {
  cacheTime?: number; // How long to cache data (ms)
  staleTime?: number; // How long before data is considered stale (ms)
  enabled?: boolean; // Whether to fetch automatically
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  dedupe?: boolean; // Deduplicate concurrent requests
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => Promise<T | null>;
  mutate: (newData: T | ((prev: T | null) => T)) => void;
}

export function useApi<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    cacheTime = DEFAULT_CACHE_TIME,
    staleTime = 0,
    enabled = true,
    onSuccess,
    onError,
    dedupe = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    if (!key) return null;
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const [isRefetching, setIsRefetching] = useState(false);

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRefetch = false): Promise<T | null> => {
    if (!key || !enabled) return null;

    // Check if data is still fresh
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached && !isRefetch) {
      const age = Date.now() - cached.timestamp;
      if (age < staleTime) {
        return cached.data;
      }
    }

    // Dedupe concurrent requests
    if (dedupe && pendingRequests.has(key)) {
      try {
        const result = await pendingRequests.get(key);
        return result as T;
      } catch (e) {
        throw e;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isRefetch) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setError(null);

    const promise = fetcher();

    if (dedupe) {
      pendingRequests.set(key, promise);
    }

    try {
      const result = await promise;

      if (mountedRef.current) {
        setData(result);
        cache.set(key, { data: result, timestamp: Date.now() });
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error("Request failed");
        setError(error);
        onError?.(error);
      }
      throw err;
    } finally {
      if (dedupe) {
        pendingRequests.delete(key);
      }
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, [key, enabled, fetcher, staleTime, dedupe, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && key && refetchOnMount) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [key, enabled, refetchOnMount]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (enabled && key) {
        fetchData(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, enabled, key, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    setData((prev) => {
      const updated = typeof newData === "function"
        ? (newData as (prev: T | null) => T)(prev)
        : newData;

      if (key) {
        cache.set(key, { data: updated, timestamp: Date.now() });
      }
      return updated;
    });
  }, [key]);

  return { data, error, isLoading, isRefetching, refetch, mutate };
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Mutation failed");
      setError(error);
      onError?.(error, variables);
      onSettled?.(null, error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    try {
      return await mutateAsync(variables);
    } catch {
      return null;
    }
  }, [mutateAsync]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, mutateAsync, data, error, isLoading, reset };
}

// Utility to invalidate cache entries
export function invalidateCache(keyPattern?: string | RegExp) {
  if (!keyPattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (typeof keyPattern === "string") {
      if (key.includes(keyPattern)) {
        cache.delete(key);
      }
    } else if (keyPattern.test(key)) {
      cache.delete(key);
    }
  }
}

// Utility to prefetch data
export async function prefetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T | null> {
  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch {
    return null;
  }
}
