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
 * - Shadow
 * - Responsive padding
 */
const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg",
        "w-full max-w-sm",
        "p-6 md:p-8",
        className
      )}
    >
      {children}
    </div>
  );
};

export default AuthCard;
