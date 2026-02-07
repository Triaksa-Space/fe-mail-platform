"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "centered" | "auth";
}

/**
 * PageLayout - Responsive page container component
 *
 * Provides consistent layout across the application with:
 * - Mobile: 390px max-width, 16px padding
 * - Desktop: 1440px max-width, 32px vertical / 176px horizontal padding
 * - Background: Neutral-50 (#F9FAFB)
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  variant = "default",
}) => {
  const baseClasses = "min-h-screen bg-gray-50 overflow-x-hidden";

  const variantClasses = {
    default: "flex flex-col",
    centered: "flex flex-col items-center justify-center",
    auth: "h-screen flex flex-col items-center justify-between overflow-hidden",
  };

  const responsiveClasses = cn(
    // Mobile first - tighter padding for mobile to prevent scroll
    "w-full px-4 py-3",
    // Desktop
    "md:px-44 md:py-8"
  );

  return (
    <div className={cn(baseClasses, variantClasses[variant], responsiveClasses, className)}>
      {children}
    </div>
  );
};

export default PageLayout;
