"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Mail, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";

interface EmailBindingFormProps {
  initialEmail?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function saveBindingEmail(email: string): Promise<void> {
  await apiClient.put("/user/binding-email", { binding_email: email });
}

const EmailBindingForm: React.FC<EmailBindingFormProps> = ({
  initialEmail = "",
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [originalEmail, setOriginalEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { toast } = useToast();

  // Update state if initialEmail prop changes
  useEffect(() => {
    setEmail(initialEmail);
    setOriginalEmail(initialEmail);
  }, [initialEmail]);

  const isValidEmail = EMAIL_REGEX.test(email);
  const hasChanged = email !== originalEmail;
  const isFormValid = isValidEmail && hasChanged;
  const isLinked = originalEmail && EMAIL_REGEX.test(originalEmail);

  // Determine if the input should be disabled (linked and not editing)
  const isInputDisabled = isLinked && !isEditing;

  const handleChangeEmail = () => {
    setIsEditing(true);
    setEmail(""); // Clear email for new input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await saveBindingEmail(email);

      toast({
        description: "Email saved successfully.",
        variant: "default",
      });

      // Update original email to reflect saved state
      setOriginalEmail(email);
      setIsEditing(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save email. Please try again.";
        setError(errorMessage);
      } else {
        setError("Failed to save email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email Input */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <div className="absolute -top-2 left-3 px-1 bg-white z-10 flex items-center gap-2">
            <span className="text-xs text-gray-500">Email</span>
            {isLinked && !isEditing && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Linked
              </span>
            )}
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              placeholder="Insert email"
              value={email}
              onChange={(e) =>
                setEmail(DOMPurify.sanitize(e.target.value).trim())
              }
              disabled={isInputDisabled}
              className={cn(
                "h-11 text-sm pl-10 pr-3 rounded-lg",
                "border-gray-200 bg-white",
                "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
                "focus:border-blue-500 focus:ring-blue-100",
                error && "border-red-500 focus:border-red-500 focus:ring-red-100",
                isInputDisabled && "bg-gray-50 text-gray-500 cursor-not-allowed"
              )}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Link an email to your account. This email will be used to reset your
          password and recover your account if needed.
        </p>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Change Email Button (when linked and not editing) */}
      {isLinked && !isEditing ? (
        <Button
          type="button"
          onClick={handleChangeEmail}
          className={cn(
            "w-full h-10 rounded-lg font-medium",
            "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Change Email
        </Button>
      ) : (
        /* Save Email Button (when not linked or editing) */
        <Button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={cn(
            "w-full h-10 rounded-lg font-medium",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "disabled:bg-blue-400 disabled:text-white disabled:opacity-100"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save email"
          )}
        </Button>
      )}
    </form>
  );
};

export default EmailBindingForm;
