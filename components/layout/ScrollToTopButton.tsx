"use client";

import React from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScrollToTopButtonProps {
  onClick: () => void;
  className?: string;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  onClick,
  className,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-lg border border-[var(--primary-100)] bg-[var(--primary-50)]",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08),0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        "hover:bg-[var(--primary-100)] transition-colors",
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="h-5 w-5 text-primary-500" />
    </Button>
  );
};

export default ScrollToTopButton;



