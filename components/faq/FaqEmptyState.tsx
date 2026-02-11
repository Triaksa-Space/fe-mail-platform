"use client";

import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react-v1/solid";
import { cn } from "@/lib/utils";

interface FaqEmptyStateProps {
  searchQuery: string;
  className?: string;
}

const FaqEmptyState: React.FC<FaqEmptyStateProps> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "self-stretch px-4 py-16 bg-white rounded-xl",
        "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
        "outline outline-1 outline-offset-[-1px] outline-gray-200",
        "flex flex-col justify-center items-center",
        className
      )}
    >
      <div className="flex flex-col justify-start items-center gap-1">
        <div className="inline-flex justify-center items-center gap-1">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          <span className="text-gray-800 text-base font-medium leading-6">
            No FAQs found
          </span>
        </div>
        <p className="text-gray-600 text-xs leading-5">
          Try adjusting your keywords and try again.
        </p>
      </div>
    </div>
  );
};

export default FaqEmptyState;


