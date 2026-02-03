"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AuthCard - Card container for authentication forms
 *
 * Provides:
 * - White background
 * - Rounded corners (xl)
 * - Shadow with subtle border
 * - Responsive padding
 */
const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl",
        "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
        "border border-gray-200",
        "w-full max-w-sm",
        "p-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default AuthCard;
