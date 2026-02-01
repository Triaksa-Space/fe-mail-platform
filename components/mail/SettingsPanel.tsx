"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";

interface SettingsPanelProps {
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onBack,
  showBackButton = false,
  className,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const email = useAuthStore((state) => state.email);

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
        description: "Password updated successfully!",
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
          setError("Failed to update password. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col bg-[#F9FAFB]", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 bg-white border-b border-gray-200">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 rounded-xl hover:bg-gray-100 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
        )}
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-md mx-auto">
          {/* Account Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Account</h3>
            <p className="text-sm text-gray-600">{email}</p>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Change Password
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 font-medium">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                      )
                    }
                    className="h-10 text-sm pl-10 pr-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                      )
                    }
                    className="h-10 text-sm pl-10 pr-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        DOMPurify.sanitize(e.target.value).replace(/\s/g, "")
                      )
                    }
                    className="h-10 text-sm pl-10 pr-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className={cn(
                  "w-full h-10 rounded-xl font-medium",
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  "disabled:bg-gray-300 disabled:text-gray-500"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
