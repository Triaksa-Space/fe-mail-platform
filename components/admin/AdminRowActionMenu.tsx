"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.right - 144,
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedMenu = dropdownRef.current?.contains(target);
      const clickedTrigger = triggerRef.current?.contains(target);
      if (!clickedMenu && !clickedTrigger) {
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

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();

    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="icon"
        ref={triggerRef}
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
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className={cn(
            "fixed w-36 z-[200]",
            "rounded-xl border border-neutral-200 bg-white shadow-lg",
            "overflow-hidden"
          )}
        >
          <div className="py-1">
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

            <div className="my-1 border-t border-neutral-100" />

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
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminRowActionMenu;


