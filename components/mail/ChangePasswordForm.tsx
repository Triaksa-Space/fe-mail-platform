"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const isFormValid = currentPassword && newPassword && confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Old Password */}
      <div className="space-y-1.5">
        <label className="text-xs text-gray-600 font-medium">Old password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Enter old password"
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
        <label className="text-xs text-gray-600 font-medium">New password</label>
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
          Confirm password
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
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className={cn(
          "w-full h-10 rounded-xl font-medium",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "disabled:bg-gray-300 disabled:text-gray-500"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Changing...
          </>
        ) : (
          "Change password"
        )}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
