"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FaqSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  className?: string;
}

const FaqSearch: React.FC<FaqSearchProps> = ({
  value,
  onChange,
  resultCount,
  className,
}) => {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={cn("self-stretch flex flex-col justify-start items-start gap-2", className)}>
      {/* Search Input */}
      <div className="self-stretch relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search any question here"
          className={cn(
            "self-stretch w-full h-10 px-3 py-2 bg-white rounded-lg",
            "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
            "outline outline-1 outline-offset-[-1px] outline-gray-200",
            "text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400",
            "transition-all pr-12"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Result Count */}
      {value.trim() && (
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{resultCount}</span>
          {" "}result{resultCount !== 1 ? "s" : ""}{" "}
          <span className="text-gray-400">&quot;{value}&quot;</span>
        </p>
      )}
    </div>
  );
};

export default FaqSearch;
