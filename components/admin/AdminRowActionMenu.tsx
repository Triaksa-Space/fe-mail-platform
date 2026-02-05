"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface AdminRowActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const AdminRowActionMenu: React.FC<AdminRowActionMenuProps> = ({
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-9 items-center justify-center",
          "rounded-lg border border-gray-200 bg-white",
          "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
        )}
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-36 z-50",
            "rounded-xl border border-gray-200 bg-white shadow-lg",
            "overflow-hidden"
          )}
        >
          <div className="py-1">
            {/* Edit */}
            <button
              onClick={() => handleAction(onEdit)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm",
                "text-gray-700 hover:bg-gray-50 transition-colors"
              )}
            >
              <Pencil className="h-4 w-4 text-gray-500" />
              <span>Edit</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100" />

            {/* Delete */}
            <button
              onClick={() => handleAction(onDelete)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm",
                "text-red-600 hover:bg-red-50 transition-colors"
              )}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRowActionMenu;
