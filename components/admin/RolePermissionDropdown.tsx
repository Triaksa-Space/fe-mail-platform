"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { AVAILABLE_PERMISSIONS } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

interface RolePermissionDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const RolePermissionDropdown: React.FC<RolePermissionDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const togglePermission = (permissionId: string) => {
    if (value.includes(permissionId)) {
      onChange(value.filter((id) => id !== permissionId));
      return;
    }
    onChange([...value, permissionId]);
  };

  const selectedText =
    value.length > 0
      ? AVAILABLE_PERMISSIONS.filter((permission) => value.includes(permission.id))
          .map((permission) => permission.label)
          .join(", ")
      : "";

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "self-stretch h-10 w-full px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
          "outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3",
          disabled ? "cursor-not-allowed bg-neutral-50" : "cursor-pointer"
        )}
      >
        <div className="flex-1 text-left text-sm font-normal font-['Roboto'] leading-4 text-neutral-800 truncate">
          {selectedText || "Select role"}
        </div>
        <ChevronDown className={cn("w-5 h-5 text-neutral-800 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && !disabled && (
        <div className="w-full p-2 left-0 top-11 absolute z-50 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-start gap-1">
          {AVAILABLE_PERMISSIONS.map((permission) => {
            const isSelected = value.includes(permission.id);
            return (
              <button
                key={permission.id}
                type="button"
                onClick={() => togglePermission(permission.id)}
                className="self-stretch h-9 p-2 bg-white rounded-lg inline-flex justify-start items-center gap-2 hover:bg-neutral-50"
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded flex items-center justify-center",
                    isSelected ? "bg-sky-600" : "bg-white border-[1.5px] border-neutral-300"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-left text-neutral-800 text-base font-normal font-['Roboto'] leading-4">
                  {permission.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RolePermissionDropdown;

