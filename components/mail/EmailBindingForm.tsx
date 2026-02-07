"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

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
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-5">
      <div className="flex flex-col gap-3">
        {/* Email Input */}
        <div className="relative flex flex-col">
          <div className="h-3.5"></div>
          <div className={cn(
            "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3",
            isInputDisabled && "bg-gray-50"
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
                  "flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400",
                  isInputDisabled && "text-gray-500 cursor-not-allowed"
                )}
              />
            </div>
            {isLinked && !isEditing && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Linked
              </span>
            )}
          </div>
          <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
            <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Email</span>
          </div>
        </div>

        <p className="text-gray-500 text-xs font-normal font-['Roboto'] leading-4">
          Link an email to your account. This email will be used to reset your
          password and recover your account if needed.
        </p>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Change Email Button (when linked and not editing) */}
      {isLinked && !isEditing ? (
        <button
          type="button"
          onClick={handleChangeEmail}
          className="h-10 px-4 py-2.5 bg-blue-600 rounded-lg shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-blue-500 inline-flex justify-center items-center gap-1.5 hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5 text-white" />
          <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">
            Change Email
          </span>
        </button>
      ) : (
        /* Save Email Button (when not linked or editing) */
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
          <CheckCircleIcon className={cn(
            "w-5 h-5",
            isFormValid && !isLoading ? "text-white" : "text-blue-300"
          )} />
          <span className={cn(
            "text-center text-base font-medium font-['Roboto'] leading-4",
            isFormValid && !isLoading ? "text-white" : "text-blue-300"
          )}>
            {isLoading ? "Saving..." : "Save email"}
          </span>
        </button>
      )}
    </form>
  );
};

export default EmailBindingForm;
