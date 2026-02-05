"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface UserRowActionMenuProps {
  onView: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
}

const UserRowActionMenu: React.FC<UserRowActionMenuProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onView,
  onChangePassword,
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            "absolute right-0 mt-1 z-50 min-w-[180px]",
            "p-2 bg-white rounded-lg",
            "shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)]",
            "inline-flex flex-col justify-start items-start gap-1"
          )}
        >
          {/* Change Password */}
          <button
            onClick={() => handleAction(onChangePassword)}
            className="h-9 p-2 w-full bg-white rounded-lg inline-flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-5 h-5 text-gray-800" />
            <div className="text-gray-800 text-base font-normal font-['Roboto'] leading-4 whitespace-nowrap">Change password</div>
          </button>

          {/* Delete */}
          <button
            onClick={() => handleAction(onDelete)}
            className="h-9 p-2 w-full bg-white rounded-lg inline-flex justify-start items-center gap-2 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div className="text-red-600 text-base font-normal font-['Roboto'] leading-4">Delete</div>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserRowActionMenu;
