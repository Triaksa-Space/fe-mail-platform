"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-white p-4",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08),0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        className
      )}
    >
      <h3 className="text-sm font-medium text-neutral-900 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default SettingsCard;
