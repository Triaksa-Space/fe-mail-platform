"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import DOMPurify from "dompurify";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface EmailBindingFormProps {
  initialEmail?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function saveBindingEmail(email: string): Promise<void> {
  const response = await apiClient.put("/user/binding-email", { binding_email: email });

  // Update tokens to keep current session alive
  if (response.data?.access_token) {
    useAuthStore.getState().setToken(response.data.access_token);
  }
  if (response.data?.refresh_token) {
    useAuthStore.getState().setRefreshToken(response.data.refresh_token);
  }
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
  const isLinked = !!originalEmail && EMAIL_REGEX.test(originalEmail);

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
        description: "Email binding changed successfully.",
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
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-5">
      <div className="flex flex-col gap-3">
        {/* Email Input */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className={cn(
            "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-neutral-200 inline-flex justify-start items-center gap-3",
            isInputDisabled && "bg-neutral-100 border-neutral-200"
          )}>
            <div className="flex-1 flex justify-start items-center gap-2">
              <input
                type="email"
                placeholder="Insert email"
                value={email}
                onChange={(e) =>
                  setEmail(DOMPurify.sanitize(e.target.value).trim())
                }
                disabled={isInputDisabled}
                className={cn(
                  "flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-400",
                  isInputDisabled && "text-neutral-500 placeholder:text-neutral-400 cursor-not-allowed"
                )}
              />
            </div>
          </div>
          <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Email</span>
          </div>
        </div>

        <p
          className={cn(
            "text-xs font-normal font-['Roboto'] leading-4",
            isInputDisabled ? "text-neutral-400" : "text-neutral-500",
          )}
        >
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
          className="h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5 text-white" />
          <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">
            Change Email
          </span>
        </Button>
      ) : (
        /* Save Email Button (when not linked or editing) */
        <Button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
        >
          <CheckCircleIcon className="w-5 h-5 text-white" />
          <span className="text-center text-base font-medium font-['Roboto'] leading-4">
            {isLoading ? "Saving..." : "Save email"}
          </span>
        </Button>
      )}
    </form>
  );
};

export default EmailBindingForm;


