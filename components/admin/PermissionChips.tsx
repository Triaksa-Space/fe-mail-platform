"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getPermissionLabel } from "@/lib/admin-types";

interface PermissionChipsProps {
  permissions: string[];
  maxVisible?: number;
  className?: string;
}

const PermissionChips: React.FC<PermissionChipsProps> = ({
  permissions,
  maxVisible,
  className,
}) => {
  const displayPermissions = maxVisible
    ? permissions.slice(0, maxVisible)
    : permissions;
  const remainingCount = maxVisible
    ? Math.max(0, permissions.length - maxVisible)
    : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {displayPermissions.map((permission) => (
        <span
          key={permission}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5",
            "text-xs font-medium",
            "bg-blue-100 text-primary-500"
          )}
        >
          {getPermissionLabel(permission)}
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5",
            "text-xs font-medium",
            "bg-neutral-100 text-neutral-600"
          )}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default PermissionChips;

