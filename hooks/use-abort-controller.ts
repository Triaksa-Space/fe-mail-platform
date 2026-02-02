import { useRef, useEffect, useCallback, useState } from "react";

/**
 * Hook that provides an AbortController that automatically aborts on unmount
 * Useful for cancelling fetch requests when component unmounts
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create a new AbortController
  const getController = useCallback(() => {
    // Abort previous controller if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  // Get signal for the current controller
  const getSignal = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current.signal;
  }, []);

  // Manually abort
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { getController, getSignal, abort };
}

/**
 * Hook for tracking mounted state to prevent state updates after unmount
 */
export function useMounted() {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}

/**
 * Hook that only updates state if component is still mounted
 */
export function useSafeState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const mountedRef = useMounted();

  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState] as const;
}
