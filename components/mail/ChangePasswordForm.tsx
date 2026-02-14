"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";
import { LockClosedIcon } from "@heroicons/react-v1/outline"
import { Button } from "@/components/ui/button";

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const getMaskLength = (value: string) => {
    if (!value) return 0;
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(segmenter.segment(value)).length;
    }
    return Array.from(value).length;
  };

  const currentPasswordMaskLength = getMaskLength(currentPassword);
  const newPasswordMaskLength = getMaskLength(newPassword);
  const confirmPasswordMaskLength = getMaskLength(confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.put("/user/change_password", {
        old_password: currentPassword,
        new_password: newPassword,
      });

      toast({
        description: "Password changed successfully.",
        variant: "default",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Current password is incorrect");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to change password. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = currentPassword && newPassword && confirmPassword && newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-5">
      <div className="flex flex-col gap-3">
        {/* Old Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3">
            <div className="flex-1 flex justify-start items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-neutral-400" />
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="***********"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                    )
                  }
                  className={`w-full bg-transparent border-none outline-none text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200 ${
                    showCurrentPassword
                      ? "text-neutral-800"
                      : "text-transparent caret-neutral-800 font-mono tracking-[0.04em] selection:text-transparent selection:bg-transparent"
                  }`}
                />
                {!showCurrentPassword && currentPasswordMaskLength > 0 && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm font-normal text-neutral-800 font-mono tracking-[0.04em]">
                    {"*".repeat(currentPasswordMaskLength)}
                  </span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="h-auto w-auto p-0 hover:bg-transparent"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5 text-neutral-800" />
              ) : (
                <Eye className="w-5 h-5 text-neutral-800" />
              )}
            </Button>
          </div>
          <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Old password</span>
          </div>
        </div>

        {/* New Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3">
            <div className="flex-1 flex justify-start items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-neutral-400" />
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="***********"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                    )
                  }
                  className={`w-full bg-transparent border-none outline-none text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200 ${
                    showNewPassword
                      ? "text-neutral-800"
                      : "text-transparent caret-neutral-800 font-mono tracking-[0.04em] selection:text-transparent selection:bg-transparent"
                  }`}
                />
                {!showNewPassword && newPasswordMaskLength > 0 && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm font-normal text-neutral-800 font-mono tracking-[0.04em]">
                    {"*".repeat(newPasswordMaskLength)}
                  </span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="h-auto w-auto p-0 hover:bg-transparent"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5 text-neutral-800" />
              ) : (
                <Eye className="w-5 h-5 text-neutral-800" />
              )}
            </Button>
          </div>
          <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">New password</span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3">
            <div className="flex-1 flex justify-start items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-neutral-400" />
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="***********"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                    )
                  }
                  className={`w-full bg-transparent border-none outline-none text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200 ${
                    showConfirmPassword
                      ? "text-neutral-800"
                      : "text-transparent caret-neutral-800 font-mono tracking-[0.04em] selection:text-transparent selection:bg-transparent"
                  }`}
                />
                {!showConfirmPassword && confirmPasswordMaskLength > 0 && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm font-normal text-neutral-800 font-mono tracking-[0.04em]">
                    {"*".repeat(confirmPasswordMaskLength)}
                  </span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="h-auto w-auto p-0 hover:bg-transparent"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-neutral-800" />
              ) : (
                <Eye className="w-5 h-5 text-neutral-800" />
              )}
            </Button>
          </div>
          <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Confirm password</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="h-10 px-4 py-2.5 btn-primary-skin gap-1.5 transition-colors"
      >
        <span className="text-center text-base font-medium font-['Roboto'] leading-4 text-white">
          {isLoading ? "Changing..." : "Change password"}
        </span>
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
