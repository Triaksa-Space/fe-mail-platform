"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Checkbox - Custom checkbox component
 *
 * Features:
 * - Custom styled checkbox with blue accent
 * - Optional label
 * - Error state support
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `checkbox-${generatedId}`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className={cn(
            "flex items-center gap-1 cursor-pointer",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="relative w-5 h-5">
            <input
              type="checkbox"
              id={inputId}
              ref={ref}
              className={cn(
                "peer h-5 w-5 shrink-0 rounded border-[1.5px] border-neutral-300",
                "focus:outline-none focus:ring-2 focus:ring-[var(--primary-500-main)] focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "checked:bg-[var(--primary-500-main)] checked:border-[var(--primary-500-main)]",
                "appearance-none cursor-pointer bg-white",
                className
              )}
              {...props}
            />
            <Check
              className={cn(
                "absolute top-0 left-0 h-5 w-5 text-white pointer-events-none p-0.5",
                "opacity-0 peer-checked:opacity-100",
                "transition-opacity duration-150"
              )}
              strokeWidth={3}
            />
          </div>
          {label && (
            <span className="text-sm font-normal text-neutral-800 select-none">{label}</span>
          )}
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
