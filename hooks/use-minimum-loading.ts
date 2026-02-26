import { useState, useEffect, useRef } from "react";

interface UseMinimumLoadingOptions {
  /** Minimum time in ms to show loading state (default: 300ms) */
  minimumDuration?: number;
  /** Delay before showing loading state to prevent flash for fast loads (default: 0ms) */
  delay?: number;
}

/**
 * Hook to prevent skeleton/loading flicker by enforcing minimum display time.
 *
 * This ensures the skeleton is shown for at least `minimumDuration` ms,
 * preventing jarring flashes when data loads quickly.
 *
 * @example
 * const { shouldShowLoading, isTransitioning } = useMinimumLoading(isLoading);
 *
 * if (shouldShowLoading) return <Skeleton />;
 * return <div className={isTransitioning ? "animate-fade-in" : ""}>Content</div>;
 */
export function useMinimumLoading(
  isLoading: boolean,
  options: UseMinimumLoadingOptions = {}
) {
  const { minimumDuration = 300, delay = 0 } = options;

  const [shouldShowLoading, setShouldShowLoading] = useState(isLoading);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minimumTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Loading started
      if (delay > 0) {
        // Delay showing loading state
        delayTimeoutRef.current = setTimeout(() => {
          loadingStartTimeRef.current = Date.now();
          setShouldShowLoading(true);
        }, delay);
      } else {
        loadingStartTimeRef.current = Date.now();
        setShouldShowLoading(true);
      }
      setIsTransitioning(false);
    } else {
      // Loading finished
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }

      if (loadingStartTimeRef.current) {
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remaining = minimumDuration - elapsed;

        if (remaining > 0) {
          // Wait for minimum duration before hiding loading
          minimumTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(true);
            setShouldShowLoading(false);
            loadingStartTimeRef.current = null;
          }, remaining);
        } else {
          // Minimum duration already passed
          setIsTransitioning(true);
          setShouldShowLoading(false);
          loadingStartTimeRef.current = null;
        }
      } else {
        // Loading never actually showed (delay wasn't reached)
        setShouldShowLoading(false);
      }
    }

    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      if (minimumTimeoutRef.current) {
        clearTimeout(minimumTimeoutRef.current);
      }
    };
  }, [isLoading, minimumDuration, delay]);

  return {
    /** Whether to show loading/skeleton state */
    shouldShowLoading,
    /** Whether content just transitioned from loading (use for fade-in) */
    isTransitioning,
  };
}

/**
 * Simpler version that just returns the debounced loading state.
 */
export function useLoadingState(
  isLoading: boolean,
  minimumDuration = 300
): boolean {
  const { shouldShowLoading } = useMinimumLoading(isLoading, { minimumDuration });
  return shouldShowLoading;
}
