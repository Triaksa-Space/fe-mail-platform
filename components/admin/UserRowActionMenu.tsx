"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PencilSquareIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";

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
            "absolute right-0 mt-1 z-50 min-w-[180px]",
            "p-2 bg-white rounded-lg",
            "shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)]",
            "inline-flex flex-col justify-start items-start gap-1"
          )}
        >
          {/* Change Password */}
          <Button
            variant="ghost"
            onClick={() => handleAction(onChangePassword)}
            className="h-9 p-2 w-full rounded-lg justify-start gap-2 hover:bg-neutral-50"
          >
            <PencilSquareIcon className="w-5 h-5 text-neutral-800" />
            <div className="text-neutral-800 text-base font-normal font-['Roboto'] leading-4 whitespace-nowrap">Change password</div>
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            onClick={() => handleAction(onDelete)}
            className="h-9 p-2 w-full rounded-lg justify-start gap-2 hover:bg-red-50"
          >
            <TrashIcon className="w-5 h-5 text-red-600" />
            <div className="text-red-600 text-base font-normal font-['Roboto'] leading-4">Delete</div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserRowActionMenu;


