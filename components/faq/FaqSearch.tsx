"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "rounded-xl bg-white border border-gray-100 p-4",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search any question here"
          className={cn(
            "w-full h-12 pl-4 pr-20 rounded-xl",
            "border border-gray-200 bg-gray-50",
            "text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white",
            "transition-all"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button
              onClick={handleClear}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Result Count */}
      {value.trim() && (
        <p className="mt-3 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{resultCount}</span>
          {" "}result{resultCount !== 1 ? "s" : ""}{" "}
          <span className="text-gray-400">&quot;{value}&quot;</span>
        </p>
      )}
    </div>
  );
};

export default FaqSearch;
