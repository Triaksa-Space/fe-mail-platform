"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminContentCardProps {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const AdminContentCard: React.FC<AdminContentCardProps> = ({
  title,
  headerRight,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-white p-4 md:p-4 border border-neutral-100",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        className
      )}
    >
      {/* Header */}
      {(title || headerRight) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {title && (
            <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
          )}
          {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
};

export default AdminContentCard;
