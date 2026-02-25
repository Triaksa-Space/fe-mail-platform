import { useEffect, useState } from "react";

/**
 * Force a component re-render at a fixed interval so relative time labels stay current.
 */
export function useRelativeTimeTicker(intervalMs = 60000): void {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTick((prev) => prev + 1);
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [intervalMs]);
}
