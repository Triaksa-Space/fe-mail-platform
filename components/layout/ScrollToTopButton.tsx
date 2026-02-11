"use client";

import React from "react";
import { ArrowUpIcon } from "@heroicons/react/outline";
import { cn } from "@/lib/utils";

interface ScrollToTopButtonProps {
  onClick: () => void;
  className?: string;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-10 h-10 bg-blue-100 rounded-lg",
        "shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)]",
        "outline outline-1 outline-offset-[-1px] outline-blue-100",
        "flex justify-center items-center",
        "hover:bg-blue-200 transition-colors",
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="h-5 w-5 text-primary-600" />
    </button>
  );
};

export default ScrollToTopButton;

