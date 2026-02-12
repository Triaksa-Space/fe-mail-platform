"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PencilSquareIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";

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
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 w-9",
          "rounded-lg border-neutral-200 bg-white",
          "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-200"
        )}
        aria-label="Actions"
      >
        <EllipsisHorizontalIcon className="h-4 w-4" />
      </Button>

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
            <Button
              variant="ghost"
              onClick={() => handleAction(onEdit)}
              className={cn(
                "w-full justify-start gap-3 px-4 py-2.5 h-auto rounded-none text-sm",
                "text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <PencilSquareIcon className="h-4 w-4 text-neutral-500" />
              <span>Edit</span>
            </Button>

            {/* Divider */}
            <div className="my-1 border-t border-neutral-100" />

            {/* Delete */}
            <Button
              variant="ghost"
              onClick={() => handleAction(onDelete)}
              className={cn(
                "w-full justify-start gap-3 px-4 py-2.5 h-auto rounded-none text-sm",
                "text-red-600 hover:bg-red-50"
              )}
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRowActionMenu;


