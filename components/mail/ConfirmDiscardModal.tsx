"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmDiscardModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}

const ConfirmDiscardModal: React.FC<ConfirmDiscardModalProps> = ({
  isOpen,
  onCancel,
  onDiscard,
}) => {
  // Handle ESC key to cancel
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        aria-describedby="discard-description"
        className={cn(
          "relative w-full max-w-sm",
          "bg-white rounded-2xl border border-gray-200 shadow-lg",
          "overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2
              id="discard-title"
              className="text-lg font-semibold text-gray-900"
            >
              Discard email?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "flex items-center justify-center h-8 w-8",
              "rounded-lg text-gray-400",
              "hover:bg-gray-100 hover:text-gray-600",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
            )}
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p id="discard-description" className="text-sm text-gray-600">
            Are you sure you want to discard this email? Any unsaved changes
            will be lost.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "h-10 px-4",
              "rounded-xl font-medium text-sm",
              "border border-gray-200 bg-white text-gray-700",
              "hover:bg-gray-50",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className={cn(
              "h-10 px-4",
              "rounded-xl font-medium text-sm",
              "bg-red-600 text-white",
              "hover:bg-red-700",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            )}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDiscardModal;
