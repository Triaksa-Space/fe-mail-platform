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
 * - Desktop: 1440px max-width, 32px vertical / 180px horizontal padding
 * - Background: Neutral-50 (#F9FAFB)
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  variant = "default",
}) => {
  const baseClasses = "min-h-screen bg-[#F9FAFB]";

  const variantClasses = {
    default: "flex flex-col",
    centered: "flex flex-col items-center justify-center",
    auth: "flex flex-col items-center justify-between",
  };

  const responsiveClasses = cn(
    // Mobile first
    "w-full px-4 py-4",
    // Desktop
    "md:px-[180px] md:py-8"
  );

  return (
    <div className={cn(baseClasses, variantClasses[variant], responsiveClasses, className)}>
      {children}
    </div>
  );
};

export default PageLayout;
