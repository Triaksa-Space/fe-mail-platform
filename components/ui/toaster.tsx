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
            className={`w-full sm:w-auto px-4 py-3 inline-flex justify-start items-center gap-4 shadow-lg pointer-events-auto ${
              isSuccess ? "bg-success-600" : ""
            } ${isDestructive ? "bg-destructive-600" : ""}`}
          >
            <div className="flex-1 flex justify-start items-center gap-2 text-left">
              {/* Leading Icon */}
              {isSuccess && (
                <div className="w-5 h-5 relative overflow-hidden flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-success-50" />
                </div>
              )}
              {isDestructive && (
                <div className="w-5 h-5 relative overflow-hidden flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-destructive-foreground" />
                </div>
              )}
              {/* Content */}
              <ToastDescription
                className={`text-sm font-medium leading-5 text-left ${
                  isSuccess ? "text-success-50" : ""
                } ${isDestructive ? "text-destructive-50" : ""}`}
              >
                {description || title}
              </ToastDescription>
            </div>
            {action}
            <ToastClose
              className={`relative w-5 h-5 opacity-100 ${
                isDestructive
                  ? "text-destructive-foreground hover:text-destructive-foreground/80"
                  : "text-success-50 hover:text-success-100"
              }`}
            />
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-full max-w-sm sm:bottom-8 sm:left-auto sm:right-0 sm:translate-x-0 sm:w-auto sm:max-w-[100vw] m-0 list-none outline-none z-[100]" />
    </ToastProvider>
  );
}
