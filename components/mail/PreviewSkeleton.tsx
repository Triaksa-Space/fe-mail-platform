"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewSkeletonProps {
  /** Show back button skeleton */
  showBackButton?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Header skeleton for Preview component.
 */
const PreviewHeaderSkeleton = memo(function PreviewHeaderSkeleton({
  showBackButton = false,
}: {
  showBackButton?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Skeleton className="h-9 w-9 rounded-xl" />
        )}
        {/* Subject */}
        <Skeleton className="h-5 w-48 md:w-64" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl hidden sm:block" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
});

/**
 * Email header card skeleton (sender info).
 */
const EmailHeaderCardSkeleton = memo(function EmailHeaderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" variant="circular" />
          <div className="min-w-0">
            {/* Name */}
            <Skeleton className="h-5 w-32" />
            {/* Email */}
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        {/* Time */}
        <Skeleton className="h-4 w-20 flex-shrink-0 ml-4" />
      </div>
    </div>
  );
});

/**
 * Email body card skeleton.
 */
const EmailBodyCardSkeleton = memo(function EmailBodyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
});

/**
 * Attachments section skeleton.
 */
const AttachmentsSkeleton = memo(function AttachmentsSkeleton({
  count = 2,
}: {
  count?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
      <Skeleton className="h-4 w-28 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Complete Preview skeleton that matches the Preview component layout.
 * Use this when loading email details.
 */
const PreviewSkeleton: React.FC<PreviewSkeletonProps> = ({
  showBackButton = false,
  className,
}) => {
  return (
    <div
      className={cn("flex-1 flex flex-col bg-[#F9FAFB]", className)}
      role="status"
      aria-busy="true"
      aria-label="Loading email details"
    >
      <PreviewHeaderSkeleton showBackButton={showBackButton} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <EmailHeaderCardSkeleton />
          <EmailBodyCardSkeleton />
          <AttachmentsSkeleton count={1} />
        </div>
      </div>

      {/* Screen reader only text */}
      <span className="sr-only">Loading email content...</span>
    </div>
  );
};

export {
  PreviewSkeleton,
  PreviewHeaderSkeleton,
  EmailHeaderCardSkeleton,
  EmailBodyCardSkeleton,
  AttachmentsSkeleton,
};
export default PreviewSkeleton;
