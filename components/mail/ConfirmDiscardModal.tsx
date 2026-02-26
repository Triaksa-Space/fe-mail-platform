"use client";

import React, { useEffect } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";

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
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        aria-describedby="discard-description"
        className="relative w-96 p-4 bg-white rounded-sm shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-center overflow-hidden"
      >
        <div className="self-stretch relative flex flex-col justify-start items-center gap-8">
          {/* Icon and Text */}
          <div className="self-stretch flex flex-col justify-start items-center gap-5">
            {/* Warning Icon */}
            <div className="w-12 h-12 p-2 bg-amber-50 rounded-3xl inline-flex justify-center items-center gap-2.5">
              <ExclamationCircleIcon className="w-6 h-6 text-amber-500" />
            </div>

            {/* Title and Description */}
            <div className="self-stretch flex flex-col justify-start items-center gap-2">
              <h2
                id="discard-title"
                className="self-stretch text-center text-neutral-900 text-lg font-medium font-['Roboto'] leading-7"
              >
                Discard email?
              </h2>
              <p
                id="discard-description"
                className="self-stretch text-center text-neutral-500 text-sm font-normal font-['Roboto'] leading-5"
              >
                Are you sure you want to discard this email? Any unsaved changes will be lost.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 gap-2 overflow-hidden hover:bg-neutral-50 transition-colors"
            >
              <span className="text-center text-neutral-700 text-base font-medium font-['Roboto'] leading-4">Cancel</span>
            </Button>
            <Button
              type="button"
              onClick={onDiscard}
              className="flex-1 h-10 px-4 py-2.5 btn-primary-skin gap-2 overflow-hidden transition-colors"
            >
              <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">Discard</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDiscardModal;
