"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 font-medium">Email</label>
          {isLinked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3" />
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
            className={cn(
              "h-10 text-sm pl-10 pr-3 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-100",
              error && "border-red-500 focus:border-red-500 focus:ring-red-100"
            )}
          />
        </div>
        <p className="text-xs text-gray-500">
          Link an email to your account. This email will be used to reset your
          password and recover your account if needed.
        </p>
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
            Saving...
          </>
        ) : (
          "Save email"
        )}
      </Button>
    </form>
  );
};

export default EmailBindingForm;
