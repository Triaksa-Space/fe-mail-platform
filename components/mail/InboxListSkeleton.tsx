"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface InboxListSkeletonProps {
  /** Number of skeleton rows to display (default: 10) */
  rowCount?: number;
  /** Whether to show the header skeleton */
  showHeader?: boolean;
  /** Additional className */
  className?: string;
  /** Full width mode */
  fullWidth?: boolean;
}

/**
 * Skeleton row that matches the exact layout of InboxRow component.
 * Memoized for performance.
 */
const InboxRowSkeleton = memo(function InboxRowSkeleton() {
  return (
    <div className="px-4 py-1.5 rounded-xl bg-gray-50">
      <div className="flex items-start gap-3">
        {/* Unread indicator dot placeholder */}
        <div className="flex-shrink-0 pt-1.5">
          <Skeleton className="w-2 h-2" variant="circular" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Sender + Time */}
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-32 sm:w-40" />
            <Skeleton className="h-4 w-16 flex-shrink-0" />
          </div>

          {/* Subject line */}
          <Skeleton className="h-4 w-3/4 mt-2" />

          {/* Snippet/Preview */}
          <Skeleton className="h-4 w-full mt-2" />
        </div>
      </div>
    </div>
  );
});

/**
 * Header skeleton matching the InboxList header.
 */
const InboxHeaderSkeleton = memo(function InboxHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      {/* Title */}
      <Skeleton className="h-6 w-16" />
      {/* Refresh button */}
      <Skeleton className="h-9 w-9 rounded-xl" />
    </div>
  );
});

/**
 * Complete inbox list skeleton that matches InboxList layout.
 * Use this during initial page load.
 */
const InboxListSkeleton: React.FC<InboxListSkeletonProps> = ({
  rowCount = 10,
  showHeader = true,
  className,
  fullWidth = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full",
        fullWidth
          ? "w-full"
          : "w-full lg:w-[360px] xl:w-[420px] lg:border-r lg:border-gray-200",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading emails"
    >
      {showHeader && <InboxHeaderSkeleton />}

      {/* Skeleton rows */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
        {Array.from({ length: rowCount }).map((_, index) => (
          <InboxRowSkeleton key={index} />
        ))}
      </div>

      {/* Screen reader only text */}
      <span className="sr-only">Loading email list...</span>
    </div>
  );
};

export { InboxListSkeleton, InboxRowSkeleton, InboxHeaderSkeleton };
export default InboxListSkeleton;
