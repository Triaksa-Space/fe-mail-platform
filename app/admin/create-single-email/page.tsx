'use client';

import React, { useEffect, useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DomainSelector from "@/components/DomainSelector";
import LoadingProcessingPage from "@/components/ProcessLoading";
import { useRouter } from "next/navigation";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import { AdminLayout, AdminContentCard } from "@/components/admin";
import { Shuffle, Copy, Check, X } from "lucide-react";

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-full"></div>
);

interface CreatedEmail {
  email: string;
  password: string;
}

const CreateSingleEmailPageContent: React.FC = () => {
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const storedToken = useAuthStore.getState().getStoredToken();
  const { toast } = useToast();

  // State variables
  const [selectedDomain, setSelectedDomain] = useState("mailria.com");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRandomPasswordActive, setIsRandomPasswordActive] = useState(false);
  const [createdEmail, setCreatedEmail] = useState<CreatedEmail | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  // Authentication loaded state
  const [authLoaded, setAuthLoaded] = useState(false);

  // Initialize authLoaded on component mount
  useEffect(() => {
    setAuthLoaded(true);
  }, []);

  // Redirect users based on authentication and role
  useEffect(() => {
    if (!authLoaded) return;

    if (!storedToken) {
      router.replace("/");
      return;
    }

    if (roleId === 1) {
      router.replace("/not-found");
    }
  }, [authLoaded, storedToken, roleId, router]);

  // If auth is not loaded yet or user is not authorized, show loading
  if (!authLoaded || roleId === 1) {
    return <LoadingFallback />;
  }

  // Toggle random password generation
  const toggleRandomPassword = () => {
    if (!isRandomPasswordActive) {
      generateRandomPassword();
      setIsRandomPasswordActive(true);
    } else {
      setPassword("");
      setIsRandomPasswordActive(false);
    }
  };

  // Generate a random password
  const generateRandomPassword = () => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    const allChars = lower + upper + numbers + symbols;

    // Ensure at least one character from each category
    let pwd = "";
    pwd += lower.charAt(Math.floor(Math.random() * lower.length));
    pwd += upper.charAt(Math.floor(Math.random() * upper.length));
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the remaining characters
    for (let i = 4; i < 12; i++) {
      pwd += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to randomize character positions
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');

    setPassword(pwd);
  };

  // Copy to clipboard
  const handleCopy = async (text: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Additional role check in case the roleId changes after component mount
      if (roleId === 1) {
        router.push("/not-found");
      }

      if (password.length < 6) {
        toast({
          description: "Password must be at least 6 characters long. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      // API call to create the user
      await apiClient.post("/user/", {
        email: `${username}@${selectedDomain}`,
        password: password,
      });

      // Store created email info for result card
      setCreatedEmail({
        email: `${username}@${selectedDomain}`,
        password: password,
      });

      // Show success toast
      toast({
        description: `Email: ${username}@${selectedDomain} Password: ${password} successfully created!`,
        variant: "default",
      });

      // Reset form fields
      setUsername("");
      setPassword("");
      setIsRandomPasswordActive(false);
    } catch (error) {
      let errorMessage = "Failed to create user. Please try again.";
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        errorMessage = error.response.data.error;
      }
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = username && password;

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Create single email
          </div>
        </div>

        {/* Form Card */}
        <AdminContentCard>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-end">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={username}
                    onChange={(e) => {
                      let value = e.target.value.toLowerCase();
                      value = value.replace(/\s/g, '');
                      value = value.replace(/[^a-zA-Z0-9]/g, '');
                      setUsername(value);
                    }}
                    placeholder="Insert email"
                    className={cn(
                      "h-11 rounded-xl border-gray-200 bg-white",
                      "focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    )}
                    required
                  />
                  <span className="text-gray-400 font-medium">@</span>
                </div>
              </div>

              {/* Domain Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 md:invisible">Domain</label>
                <DomainSelector
                  value={selectedDomain}
                  onChange={(value) => setSelectedDomain(value)}
                  className="h-11 w-full md:w-[180px] rounded-xl border-gray-200"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                      setPassword(sanitizedValue);
                    }}
                    placeholder="Insert password"
                    className={cn(
                      "h-11 rounded-xl border-gray-200",
                      isRandomPasswordActive ? "bg-gray-100" : "bg-white",
                      "focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    )}
                    disabled={isRandomPasswordActive}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleRandomPassword}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                      isRandomPasswordActive
                        ? "bg-blue-100 border-blue-300 text-blue-600"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                    )}
                    title="Generate random password"
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 md:invisible">Action</label>
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={cn(
                    "h-11 w-full md:w-auto px-6 rounded-xl font-medium transition-colors",
                    isFormValid && !isLoading
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  )}
                >
                  Create email
                </button>
              </div>
            </div>
          </form>
        </AdminContentCard>

        {/* Result Card */}
        {createdEmail && (
          <AdminContentCard className="relative">
            <button
              onClick={() => setCreatedEmail(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Email Created Successfully</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Email */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{createdEmail.email}</p>
                </div>
                <button
                  onClick={() => handleCopy(createdEmail.email, 'email')}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    copiedField === 'email'
                      ? "bg-green-100 text-green-600"
                      : "bg-white border border-gray-200 text-gray-500 hover:text-gray-700"
                  )}
                >
                  {copiedField === 'email' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">Password</p>
                  <p className="font-medium text-gray-900 font-mono">{createdEmail.password}</p>
                </div>
                <button
                  onClick={() => handleCopy(createdEmail.password, 'password')}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    copiedField === 'password'
                      ? "bg-green-100 text-green-600"
                      : "bg-white border border-gray-200 text-gray-500 hover:text-gray-700"
                  )}
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </AdminContentCard>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && <LoadingProcessingPage />}
    </AdminLayout>
  );
};

// Wrap the content component with Suspense
const CreateSingleEmailPage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <CreateSingleEmailPageContent />
  </Suspense>
);

export default CreateSingleEmailPage;
