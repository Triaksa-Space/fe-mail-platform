"use client";

import React from "react";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqEmptyStateProps {
  searchQuery: string;
  className?: string;
}

const FaqEmptyState: React.FC<FaqEmptyStateProps> = ({
  searchQuery,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-gray-100",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        "py-16 px-6",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No FAQs found
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 max-w-sm">
          We couldn&apos;t find any FAQs matching &quot;{searchQuery}&quot;.
          <br />
          Try adjusting your keywords and try again.
        </p>
      </div>
    </div>
  );
};

export default FaqEmptyState;
