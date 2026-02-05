"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";

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
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {/* Old Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
            <div className="flex-1 flex justify-start items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="***********"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                  )
                }
                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="flex justify-center items-center"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5 text-gray-800" />
              ) : (
                <Eye className="w-5 h-5 text-gray-800" />
              )}
            </button>
          </div>
          <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Old password</span>
          </div>
        </div>

        {/* New Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
            <div className="flex-1 flex justify-start items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="***********"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                  )
                }
                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="flex justify-center items-center"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5 text-gray-800" />
              ) : (
                <Eye className="w-5 h-5 text-gray-800" />
              )}
            </button>
          </div>
          <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">New password</span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
            <div className="flex-1 flex justify-start items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="***********"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                  )
                }
                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="flex justify-center items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-gray-800" />
              ) : (
                <Eye className="w-5 h-5 text-gray-800" />
              )}
            </button>
          </div>
          <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Confirm password</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className={cn(
          "h-10 px-4 py-2.5 rounded-lg shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] inline-flex justify-center items-center gap-1.5 transition-colors",
          isFormValid && !isLoading
            ? "bg-blue-600 outline outline-1 outline-offset-[-1px] outline-blue-500 hover:bg-blue-700"
            : "bg-blue-400 outline outline-1 outline-offset-[-1px] outline-blue-300 cursor-not-allowed"
        )}
      >
        <Check className={cn(
          "w-5 h-5",
          isFormValid && !isLoading ? "text-white" : "text-blue-300"
        )} />
        <span className={cn(
          "text-center text-base font-medium font-['Roboto'] leading-4",
          isFormValid && !isLoading ? "text-white" : "text-blue-300"
        )}>
          {isLoading ? "Changing..." : "Change password"}
        </span>
      </button>
    </form>
  );
};

export default ChangePasswordForm;
