"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider
      swipeDirection="right"
      duration={2000} // Auto close after 2 seconds
    >
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const isSuccess = variant === "default";
        const isDestructive = variant === "destructive";

        return (
          <Toast
            key={id}
            {...props}
            className={`px-4 py-3 inline-flex justify-start items-center gap-4 shadow-lg pointer-events-auto ${
              isSuccess ? "bg-green-600" : ""
            } ${isDestructive ? "bg-red-600" : ""}`}
          >
            <div className="flex justify-start items-center gap-2">
              {/* Leading Icon */}
              <div className="w-5 h-5 relative overflow-hidden flex items-center justify-center">
                {isSuccess && (
                  <CheckCircleIcon className="w-5 h-5 text-green-50" />
                )}
                {isDestructive && (
                  <XCircleIcon className="w-5 h-5 text-red-50" />
                )}
              </div>
              {/* Content */}
              <ToastDescription
                className={`text-sm font-medium leading-5 ${
                  isSuccess ? "text-green-50" : ""
                } ${isDestructive ? "text-red-50" : ""}`}
              >
                {description || title}
              </ToastDescription>
            </div>
            {action}
            <ToastClose
              className={`relative w-5 h-5 opacity-100 ${
                isSuccess
                  ? "text-green-50 hover:text-green-100"
                  : "text-red-50 hover:text-red-100"
              }`}
            />
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col gap-2 w-auto max-w-[100vw] m-0 list-none p-4 outline-none z-[100]" />
    </ToastProvider>
  );
}

