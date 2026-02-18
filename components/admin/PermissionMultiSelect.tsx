"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown} from "lucide-react";
import { AVAILABLE_PERMISSIONS, getPermissionLabel } from "@/lib/admin-types";
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button";

interface PermissionMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  displayMode?: "badges" | "text";
  dropdownPosition?: "bottom" | "top";
}

const PermissionMultiSelect: React.FC<PermissionMultiSelectProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  displayMode = "badges",
  dropdownPosition = "bottom",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
    } else {
      onChange([...value, permissionId]);
    }
  };

  const removePermission = (permissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== permissionId));
  };

  return (
    <div className={cn("relative", isOpen && "z-[70]")} ref={containerRef}>
      {/* Selected permissions display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "min-h-[42px] px-3 py-2 rounded-lg border transition-colors cursor-pointer",
          "flex flex-wrap gap-1.5 items-center",
          disabled
            ? "bg-neutral-100 border-neutral-200 cursor-not-allowed"
            : isOpen
            ? "border-blue-500 ring-2 ring-blue-100"
            : error
            ? "border-red-500"
            : "border-neutral-200 hover:border-neutral-300"
        )}
      >
        {value.length === 0 ? (
          <span className="text-sm text-neutral-400">Select permissions...</span>
        ) : displayMode === "text" ? (
          <span className="text-sm text-neutral-800 truncate flex-1">
            {value.map((id) => getPermissionLabel(id)).join(", ")}
          </span>
        ) : (
          value.map((permissionId) => (
            <span
              key={permissionId}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
                "text-xs font-medium",
                "bg-primary-50 text-primary-500"
              )}
            >
              {getPermissionLabel(permissionId)}
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => removePermission(permissionId, e)}
                  className="h-auto w-auto p-0.5 hover:bg-primary-100 rounded-full"
                >
                  <XMarkIcon className="h-3 w-3" />
                </Button>
              )}
            </span>
          ))
        )}
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-neutral-400 shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          className={cn(
            "absolute z-[70] w-full max-h-60 overflow-auto",
            "rounded-lg border border-neutral-200 bg-white shadow-lg",
            "py-1",
            dropdownPosition === "top" ? "bottom-full mb-1" : "mt-1"
          )}
        >
          {AVAILABLE_PERMISSIONS.map((permission) => {
            const isSelected = value.includes(permission.id);
            return (
              <Button
                key={permission.id}
                type="button"
                variant="ghost"
                onClick={() => togglePermission(permission.id)}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2 h-auto rounded-none text-sm",
                  "hover:bg-neutral-50 text-left",
                  isSelected && "bg-primary-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border shrink-0",
                    isSelected
                      ? "bg-primary-600 border-primary-600"
                      : "border-neutral-300"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span
                  className={cn(
                    "flex-1",
                    isSelected ? "text-primary-500 font-medium" : "text-neutral-700"
                  )}
                >
                  {permission.label}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default PermissionMultiSelect;



