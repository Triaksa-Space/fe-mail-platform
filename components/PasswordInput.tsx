"use client";

import { Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { LockClosedIcon } from "@heroicons/react-v1/outline"

interface PasswordInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error?: string | null;
  className?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * PasswordInput - Reusable password input component
 *
 * Features:
 * - Lock icon on the left
 * - Show/hide password toggle
 * - Error state with message
 * - Clean, compact design following Mailria design system
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  placeholder,
  value,
  onChange,
  showPassword,
  setShowPassword,
  error,
  className,
  label,
  disabled,
}) => (
  <div className={cn("space-y-1", className)}>
    {label && (
      <label htmlFor={id} className="text-xs text-neutral-600 font-medium">
        {label}
      </label>
    )}
    <div className="relative">
      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
      <Input
        className={cn(
          "h-10 text-sm pl-10 pr-10",
          "border-neutral-200 rounded-lg",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          "placeholder:text-neutral-200",
          "transition-colors duration-200",
          error && "border-red-500 focus:border-red-500 focus:ring-red-100",
          disabled && "bg-neutral-100 cursor-not-allowed"
        )}
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <button
        type="button"
        className={cn(
          "absolute inset-y-0 right-0 pr-3 flex items-center",
          "text-neutral-400 hover:text-neutral-600 transition-colors",
          disabled && "cursor-not-allowed"
        )}
        onClick={() => !disabled && setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default PasswordInput;
