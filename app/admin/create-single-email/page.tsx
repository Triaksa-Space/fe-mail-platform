'use client';

import React, { useEffect, useState, Suspense } from "react";
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
import { CheckCircleIcon, DocumentDuplicateIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline"

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

  // Set page title
  useEffect(() => {
    document.title = "Create Single - Admin Mailria";
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
        <div className="self-stretch inline-flex justify-start items-center gap-5">
          <div className="text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Create Single
          </div>
        </div>

        {/* Form Card */}
        <AdminContentCard className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Email Input with Floating Label */}
              <div className="flex-1 relative flex flex-col">
                <div className="h-3.5"></div>
                <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-gray-200 flex items-center gap-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      let value = e.target.value.toLowerCase();
                      value = value.replace(/\s/g, '');
                      value = value.replace(/[^a-zA-Z0-9]/g, '');
                      setUsername(value);
                    }}
                    placeholder="Insert email"
                    className="flex-1 bg-transparent text-gray-800 text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                  <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Email</span>
                </div>
              </div>

              {/* Domain Selector with Floating Label */}
              <div className="flex-1 relative flex flex-col">
                <div className="h-3.5"></div>
                <DomainSelector
                  value={selectedDomain}
                  onChange={(value) => setSelectedDomain(value)}
                  className="h-10 w-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 text-gray-800 text-sm font-normal font-['Roboto'] [&>button]:h-full [&>button]:border-0 [&>button]:shadow-none [&>button]:ring-0 [&>button]:rounded-lg"
                />
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center z-10">
                  <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Domain</span>
                </div>
              </div>

              {/* Password Input with Floating Label */}
              <div className="flex-1 relative flex flex-col">
                <div className="h-3.5"></div>
                <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-gray-200 flex items-center gap-3">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                      setPassword(sanitizedValue);
                    }}
                    placeholder="Insert password"
                    className={cn(
                      "flex-1 bg-transparent text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-gray-400",
                      isRandomPasswordActive ? "text-gray-500" : "text-gray-800"
                    )}
                    disabled={isRandomPasswordActive}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleRandomPassword}
                    className={cn(
                      "w-5 h-5 flex items-center justify-center transition-colors",
                      isRandomPasswordActive
                        ? "text-primary-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    title="Generate random password"
                  >
                  </button>
                </div>
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                  <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Password</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-300"></div>

            {/* Submit Button - Right Aligned */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-base font-medium font-['Roboto'] leading-4">Create email</span>
              </button>
            </div>
          </form>
        </AdminContentCard>

        {/* Result Card */}
        {createdEmail && (
          <AdminContentCard className="w-full">
            <div className="flex items-start gap-4">
              {/* Gray Card - Full Width */}
              <div className="flex-1 p-4 bg-gray-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-wrap justify-start items-start gap-10">
                {/* Email */}
                <div className="flex justify-start items-start gap-1">
                  <div className="flex justify-start items-center gap-1">
                    <span className="text-gray-800 text-sm font-normal font-['Roboto'] leading-5">Email</span>
                    <span className="text-gray-800 text-sm font-normal font-['Roboto'] leading-5">:</span>
                  </div>
                  <span className="text-gray-800 text-sm font-semibold font-['Roboto'] leading-5">{createdEmail.email}</span>
                  <button
                    onClick={() => handleCopy(createdEmail.email, 'email')}
                    className="w-5 h-5 flex items-center justify-center transition-colors"
                  >
                    {copiedField === 'email' ? (
                      <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-primary-600" />
                    )}
                  </button>
                </div>

                {/* Password */}
                <div className="flex justify-start items-start gap-1">
                  <div className="flex justify-start items-center gap-1">
                    <span className="text-gray-800 text-sm font-normal font-['Roboto'] leading-5">Password</span>
                    <span className="text-gray-800 text-sm font-normal font-['Roboto'] leading-5">:</span>
                  </div>
                  <span className="text-gray-800 text-sm font-semibold font-['Roboto'] leading-5 font-mono">{createdEmail.password}</span>
                  <button
                    onClick={() => handleCopy(createdEmail.password, 'password')}
                    className="w-5 h-5 flex items-center justify-center transition-colors"
                  >
                    {copiedField === 'password' ? (
                      <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-primary-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Close Button - Outside Gray Card */}
              <button
                onClick={() => setCreatedEmail(null)}
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
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
