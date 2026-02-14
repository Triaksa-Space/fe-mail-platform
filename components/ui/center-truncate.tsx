"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CenterTruncateProps {
  children: React.ReactNode;
  className?: string;
  reservePx?: number;
  minWidthPx?: number;
  side?: "left" | "right";
}

const CenterTruncate: React.FC<CenterTruncateProps> = ({
  children,
  className,
  reservePx = 12,
  minWidthPx = 0,
  side = "left",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateMaxWidth = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = window.innerWidth / 2;
      const available =
        side === "right"
          ? Math.floor(rect.right - center - reservePx)
          : Math.floor(center - rect.left - reservePx);
      setMaxWidth(Math.max(minWidthPx, available));
    };

    updateMaxWidth();
    window.addEventListener("resize", updateMaxWidth);

    const observer = new ResizeObserver(updateMaxWidth);
    if (ref.current) observer.observe(ref.current);

    return () => {
      window.removeEventListener("resize", updateMaxWidth);
      observer.disconnect();
    };
  }, [reservePx, minWidthPx, side]);

  return (
    <span
      ref={ref}
      className={cn("block truncate", className)}
      style={maxWidth !== null ? { maxWidth: `${maxWidth}px` } : undefined}
      title={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
};

export default CenterTruncate;
