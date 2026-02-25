"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { LockClosedIcon } from "@heroicons/react-v1/outline"
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { usePasswordMask } from "@/hooks/use-password-mask";

const ChangePasswordForm: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentPasswordMask = usePasswordMask(showCurrentPassword);
  const newPasswordMask = usePasswordMask(showNewPassword);
  const confirmPasswordMask = usePasswordMask(showConfirmPassword);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const passwordsDoNotMatch =
    confirmPasswordMask.password.length > 0 &&
    newPasswordMask.password !== confirmPasswordMask.password;

  useEffect(() => {
    if (!currentPasswordMask.password) setShowCurrentPassword(false);
  }, [currentPasswordMask.password]);

  useEffect(() => {
    if (!newPasswordMask.password) setShowNewPassword(false);
  }, [newPasswordMask.password]);

  useEffect(() => {
    if (!confirmPasswordMask.password) setShowConfirmPassword(false);
  }, [confirmPasswordMask.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    const currentPassword = currentPasswordMask.password;
    const newPassword = newPasswordMask.password;
    const confirmPassword = confirmPasswordMask.password;

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
      const response = await apiClient.put("/user/change_password", {
        old_password: currentPassword,
        new_password: newPassword,
      });

      // Update tokens to keep current session alive
      if (response.data?.access_token) {
        useAuthStore.getState().setToken(response.data.access_token);
      }
      if (response.data?.refresh_token) {
        useAuthStore.getState().setRefreshToken(response.data.refresh_token);
      }

      toast({
        description: "Password changed successfully.",
        variant: "default",
      });

      // Reset form
      currentPasswordMask.setPassword("");
      newPasswordMask.setPassword("");
      confirmPasswordMask.setPassword("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("The password you entered is incorrect.");
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

  const isFormFilled =
    currentPasswordMask.password.length > 0 &&
    newPasswordMask.password.length > 0 &&
    confirmPasswordMask.password.length > 0;
  const isFormValid = isFormFilled && newPasswordMask.password === confirmPasswordMask.password;

  return (
    <>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {/* Old Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className={`h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-3 ${
            error === "The password you entered is incorrect." ? "outline-red-500" : "outline-neutral-200"
          }`}>
            <div className="flex-1 flex justify-start items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-neutral-400" />
              <div className="relative flex-1">
                <input
                  placeholder="***********"
                  autoComplete="current-password"
                  ref={currentPasswordMask.inputRef}
                  {...currentPasswordMask.inputProps}
                  className="w-full bg-transparent border-none outline-none text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-400 text-neutral-800"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!currentPasswordMask.password}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="h-5 w-5 p-0 shrink-0 hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {showCurrentPassword ? (
                <Eye className="w-5 h-5 text-neutral-800" />
              ) : (
                <EyeOff className="w-5 h-5 text-neutral-800" />
              )}
            </Button>
          </div>
          <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Old password</span>
          </div>
          {error === "The password you entered is incorrect." && (
            <p className="text-xs text-red-500 mt-1">The password you entered is incorrect.</p>
          )}
        </div>

        {/* New Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className={`h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-3 ${
            error === "Password must be at least 6 characters" || passwordsDoNotMatch
              ? "outline-red-500"
              : "outline-neutral-200"
          }`}>
            <div className="flex-1 flex justify-start items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-neutral-400" />
              <div className="relative flex-1">
                <input
                  placeholder="***********"
                  autoComplete="new-password"
                  ref={newPasswordMask.inputRef}
                  {...newPasswordMask.inputProps}
                  className="w-full bg-transparent border-none outline-none text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-400 text-neutral-800"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!newPasswordMask.password}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="h-5 w-5 p-0 shrink-0 hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {showNewPassword ? (
                <Eye className="w-5 h-5 text-neutral-800" />
              ) : (
                <EyeOff className="w-5 h-5 text-neutral-800" />
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
          <div className={`h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-3 ${
            passwordsDoNotMatch ? "outline-red-500" : "outline-neutral-200"
          }`}>
            <div className="flex-1 flex justify-start items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-neutral-400" />
              <div className="relative flex-1">
                <input
                  placeholder="***********"
                  autoComplete="new-password"
                  ref={confirmPasswordMask.inputRef}
                  {...confirmPasswordMask.inputProps}
                  className="w-full bg-transparent border-none outline-none text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-400 text-neutral-800"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!confirmPasswordMask.password}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="h-5 w-5 p-0 shrink-0 hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {showConfirmPassword ? (
                <Eye className="w-5 h-5 text-neutral-800" />
              ) : (
                <EyeOff className="w-5 h-5 text-neutral-800" />
              )}
            </Button>
          </div>
          <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Confirm password</span>
          </div>
          {passwordsDoNotMatch && (
            <p className="text-xs text-red-500 mt-1">Your confirmation password doesn&apos;t match</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error &&
        error !== "Passwords do not match" &&
        error !== "The password you entered is incorrect." && (
          <p className="text-sm text-red-600">{error}</p>
        )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="h-10 px-4 py-2.5 btn-primary-skin gap-1.5 transition-colors"
      >
        <span className="text-center text-base font-medium font-['Roboto'] leading-4">
          {isLoading ? "Changing..." : "Change password"}
        </span>
      </Button>
      </form>
      <Toaster />
    </>
  );
};

export default ChangePasswordForm;
