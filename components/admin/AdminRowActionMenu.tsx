"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PencilSquareIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

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
          "rounded-lg border border-neutral-200 bg-white",
          "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
        )}
        aria-label="Actions"
      >
        <EllipsisHorizontalIcon className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-36 z-50",
            "rounded-xl border border-neutral-200 bg-white shadow-lg",
            "overflow-hidden"
          )}
        >
          <div className="py-1">
            {/* Edit */}
            <button
              onClick={() => handleAction(onEdit)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm",
                "text-neutral-700 hover:bg-neutral-50 transition-colors"
              )}
            >
              <PencilSquareIcon className="h-4 w-4 text-neutral-500" />
              <span>Edit</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-neutral-100" />

            {/* Delete */}
            <button
              onClick={() => handleAction(onDelete)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm",
                "text-red-600 hover:bg-red-50 transition-colors"
              )}
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRowActionMenu;


