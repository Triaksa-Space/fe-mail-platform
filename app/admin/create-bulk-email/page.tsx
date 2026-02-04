'use client'

import { useEffect, useState, Suspense } from "react"
import { Minus, Plus, Shuffle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuthStore } from "@/stores/useAuthStore"
import axios from 'axios'
import { apiClient } from "@/lib/api-client"
import DomainSelector from "@/components/DomainSelector"
import LoadingProcessingPage from "@/components/ProcessLoading"
import { useRouter } from "next/navigation"
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils"
import { AdminLayout, AdminContentCard } from "@/components/admin"

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-full"></div>
);

const CreateBulkEmailPageContent: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("mailria.com")
  const [count, setCount] = useState(2)
  const [password, setPassword] = useState("")
  const [baseName, setBaseName] = useState("")
  const { toast } = useToast()
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const storedToken = useAuthStore.getState().getStoredToken();

  const [receiveEmail, setReceiveEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRandomPasswordActive, setIsRandomPasswordActive] = useState(false);
  const [isRandomNameActive, setIsRandomNameActive] = useState(false);

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

  const toggleRandomPassword = () => {
    if (!isRandomPasswordActive) {
      generateRandomPassword();
      setIsRandomPasswordActive(true);
    } else {
      setPassword("");
      setIsRandomPasswordActive(false);
    }
  };

  const toggleRandomName = () => {
    if (!isRandomNameActive) {
      setIsRandomNameActive(true);
      setBaseName("random");
    } else {
      setIsRandomNameActive(false);
      setBaseName("");
    }
  };

  const updateCount = (newCount: number) => {
    if (newCount >= 2 && newCount <= 100) {
      setCount(newCount)
    }
  }

  const generateRandomPassword = () => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    const allChars = lower + upper + numbers + symbols;

    // Ensure at least one character from each category
    let password = "";
    password += lower.charAt(Math.floor(Math.random() * lower.length));
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the remaining characters
    for (let i = 4; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to randomize character positions
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    setPassword(password);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      toast({
        description: "Please provide a password.",
        variant: "destructive",
      })
      return
    }
    if (count < 2 || count > 100) {
      toast({
        description: "Quantity must be between 2 and 100. Please try again.",
        variant: "destructive",
      })
      return
    }
    if (password.length < 6) {
      toast({
        description: "Password must be at least 6 characters long. Please try again.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      await apiClient.post("/user/bulk", {
        base_name: baseName || "random",
        quantity: count,
        password: password,
        send_to: receiveEmail,
        domain: selectedDomain
      })
      toast({
        description: `Successfully created ${count} accounts.`,
        variant: "default",
      })
      // Reset the form
      setBaseName("")
      setPassword("")
      setReceiveEmail("")
    } catch (error) {
      let errorMessage = "Failed to create users. Please try again."
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      toast({
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRandomPasswordActive(false)
      setIsRandomNameActive(false)
    }
  }

  const isFormValid = receiveEmail && baseName && password;

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Create bulk email
          </div>
        </div>

        {/* Form Card */}
        <AdminContentCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Email Name + Domain */}
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
              {/* Email Base Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email prefix</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={isRandomNameActive ? "random" : baseName}
                    placeholder="Enter base name"
                    className={cn(
                      "h-11 rounded-xl border-gray-200",
                      isRandomNameActive ? "bg-gray-100" : "bg-white",
                      "focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    )}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
                      const domPurifyValue = DOMPurify.sanitize(sanitizedValue);
                      setBaseName(domPurifyValue);
                    }}
                    disabled={isRandomNameActive}
                  />
                  <button
                    type="button"
                    onClick={toggleRandomName}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                      isRandomNameActive
                        ? "bg-blue-100 border-blue-300 text-blue-600"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                    )}
                    title="Use random names"
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>
                  <span className="text-gray-400 font-medium">@</span>
                </div>
              </div>

              {/* Domain Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Domain</label>
                <DomainSelector
                  value={selectedDomain}
                  onChange={(value) => setSelectedDomain(value)}
                  className="h-11 w-full md:w-[180px] rounded-xl border-gray-200"
                />
              </div>

              {/* Quantity Stepper */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => updateCount(count - 1)}
                    disabled={count <= 2}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-l-xl border border-r-0 transition-colors",
                      count <= 2
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <Input
                    type="text"
                    value={count}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        const numericValue = parseInt(value, 10);
                        if (!isNaN(numericValue) && numericValue <= 100) {
                          setCount(numericValue);
                        } else if (value === "") {
                          setCount(2);
                        }
                      }
                    }}
                    className="h-11 w-16 rounded-none border-gray-200 text-center focus:z-10"
                  />
                  <button
                    type="button"
                    onClick={() => updateCount(count + 1)}
                    disabled={count >= 100}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-r-xl border border-l-0 transition-colors",
                      count >= 100
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">Min 2, max 100</p>
              </div>
            </div>

            {/* Row 2: Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="flex items-center gap-2 max-w-md">
                <Input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                    setPassword(sanitizedValue);
                  }}
                  placeholder="Enter password"
                  className={cn(
                    "h-11 rounded-xl border-gray-200",
                    isRandomPasswordActive ? "bg-gray-100" : "bg-white",
                    "focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  )}
                  disabled={isRandomPasswordActive}
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
              <p className="text-xs text-gray-500">All accounts will use the same password</p>
            </div>

            {/* Row 3: Receive Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Send results to</label>
              <Input
                type="email"
                value={receiveEmail}
                onChange={(e) => {
                  const value = e.target.value;
                  const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                  setReceiveEmail(sanitizedValue);
                }}
                placeholder="Email for receiving account list"
                className={cn(
                  "h-11 max-w-md rounded-xl border-gray-200 bg-white",
                  "focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                )}
              />
              <p className="text-xs text-gray-500">You will receive a list of created accounts at this email</p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={cn(
                  "h-11 px-8 rounded-xl font-medium transition-colors",
                  isFormValid && !isLoading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                )}
              >
                Create {count} emails
              </button>
            </div>
          </form>
        </AdminContentCard>
      </div>

      {/* Loading Indicator */}
      {isLoading && <LoadingProcessingPage />}
    </AdminLayout>
  )
}

// Wrap the content component with Suspense
const CreateBulkEmailPage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <CreateBulkEmailPageContent />
  </Suspense>
);

export default CreateBulkEmailPage
