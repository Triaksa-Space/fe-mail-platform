'use client'

import { useEffect, useState, Suspense } from "react"
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
import { CheckCircleIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline"
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <AdminLoadingPlaceholder heightClassName="h-64" />
);

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  active: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}> = ({ active, onChange, label, className }) => (
  <div className={cn("h-10 flex justify-start items-center gap-1 shrink-0", className)}>
    <button
      type="button"
      onClick={onChange}
      className="w-10 h-6 relative"
    >
      <div className={cn(
        "w-10 h-6 rounded-3xl transition-colors",
        active ? "bg-blue-600" : "bg-gray-200"
      )}></div>
      <div className={cn(
        "w-5 h-5 absolute top-[1.5px] bg-white rounded-full transition-all",
        active ? "left-[18.5px]" : "left-[1.5px]"
      )}></div>
    </button>
    <span className="text-gray-800 text-sm font-normal font-['Roboto'] leading-4">{label}</span>
  </div>
);

const CreateBulkEmailPageContent: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("mailria.com")
  const [count, setCount] = useState(2)
  const [password, setPassword] = useState("")
  const [baseName, setBaseName] = useState("")
  const [passwordLength, setPasswordLength] = useState(6)
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

  // Set page title
  useEffect(() => {
    document.title = "Create Bulk - Admin Mailria";
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
    setIsRandomPasswordActive(!isRandomPasswordActive);
    if (!isRandomPasswordActive) {
      setPassword("");
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

  const updatePasswordLength = (newLength: number) => {
    if (newLength >= 6 && newLength <= 32) {
      setPasswordLength(newLength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isRandomPasswordActive && !password) {
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
    if (!isRandomPasswordActive && password.length < 6) {
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
        password: isRandomPasswordActive ? `random:${passwordLength}` : password,
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
        errorMessage = error.response.data.message
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

  const isFormValid = receiveEmail && (baseName || isRandomNameActive) && (password || isRandomPasswordActive);

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-start items-center gap-5">
          <div className="text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Create Bulk
          </div>
        </div>

        {/* Form Card */}
        <AdminContentCard className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Row 1: Email + Random toggle | Domain | Quantity + buttons */}
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Email Input + Random Toggle */}
              <div className="flex-1 flex justify-start items-end gap-4">
                <div className="flex-1 relative flex flex-col">
                  <div className="h-3.5"></div>
                  <div className={cn(
                    "h-10 px-3 py-2 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-gray-200 flex items-center gap-3",
                    isRandomNameActive ? "bg-gray-100" : "bg-white"
                  )}>
                    <input
                      type="text"
                      value={isRandomNameActive ? "" : baseName}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
                        const domPurifyValue = DOMPurify.sanitize(sanitizedValue);
                        setBaseName(domPurifyValue);
                      }}
                      placeholder="Insert email"
                      disabled={isRandomNameActive}
                      className={cn(
                        "flex-1 bg-transparent text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-gray-400",
                        isRandomNameActive ? "text-gray-400" : "text-gray-800"
                      )}
                    />
                  </div>
                  <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                    <span className={cn(
                      "text-[10px] font-normal font-['Roboto'] leading-4",
                      isRandomNameActive ? "text-gray-400" : "text-gray-800"
                    )}>Email</span>
                  </div>
                </div>
                <ToggleSwitch
                  active={isRandomNameActive}
                  onChange={toggleRandomName}
                  label="Random email"
                  className="w-[130px]"
                />
              </div>

              {/* Domain Selector */}
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

              {/* Quantity Input + Buttons */}
              <div className="flex-1 flex justify-start items-end gap-2">
                <div className="flex-1 relative flex flex-col">
                  <div className="h-3.5"></div>
                  <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-gray-200 flex items-center justify-center gap-3">
                    <input
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
                      className="w-full bg-transparent text-gray-800 text-sm font-normal font-['Roboto'] leading-4 outline-none text-center"
                    />
                  </div>
                  <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                    <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4 whitespace-nowrap">Quantity (minimum 2, maximum 100)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateCount(count - 1)}
                  disabled={count <= 2}
                  className={cn(
                    "w-10 h-10 p-2 rounded-lg outline outline-1 outline-gray-200 flex justify-center items-center shrink-0",
                    count <= 2
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateCount(count + 1)}
                  disabled={count >= 100}
                  className={cn(
                    "w-10 h-10 p-2 rounded-lg outline outline-1 flex justify-center items-center shrink-0",
                    count >= 100
                      ? "bg-gray-100 outline-gray-200 text-gray-300 cursor-not-allowed"
                      : "bg-blue-100 outline-blue-100 text-primary-500 hover:bg-blue-200"
                  )}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Row 2: Same password + Random toggle | Password length + buttons | Email for receiving */}
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Same Password + Random Toggle */}
              <div className="flex-[1.2] flex justify-start items-end gap-4">
                <div className="flex-1 relative flex flex-col">
                  <div className="h-3.5"></div>
                  <div className={cn(
                    "h-10 px-3 py-2 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-gray-200 flex items-center gap-3",
                    isRandomPasswordActive ? "bg-gray-100" : "bg-white"
                  )}>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                        setPassword(sanitizedValue);
                      }}
                      placeholder="Insert password"
                      disabled={isRandomPasswordActive}
                      className={cn(
                        "flex-1 bg-transparent text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-gray-400",
                        isRandomPasswordActive ? "text-gray-400" : "text-gray-800"
                      )}
                    />
                  </div>
                  <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                    <span className={cn(
                      "text-[10px] font-normal font-['Roboto'] leading-4",
                      isRandomPasswordActive ? "text-gray-400" : "text-gray-800"
                    )}>Same password</span>
                  </div>
                </div>
                <ToggleSwitch
                  active={isRandomPasswordActive}
                  onChange={toggleRandomPassword}
                  label="Random pass"
                  className="w-[130px]"
                />
              </div>

              {/* Password Length + Buttons */}
              <div className="flex-[0.8] flex justify-start items-end gap-2">
                <div className="flex-1 relative flex flex-col">
                  <div className="h-3.5"></div>
                  <div className={cn(
                    "h-10 px-3 py-2 rounded-lg outline outline-1 outline-gray-200 flex items-center justify-center gap-3 overflow-hidden",
                    !isRandomPasswordActive ? "bg-gray-100" : "bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]"
                  )}>
                    <input
                      type="text"
                      value={passwordLength}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          const numericValue = parseInt(value, 10);
                          if (!isNaN(numericValue) && numericValue <= 32) {
                            setPasswordLength(numericValue);
                          } else if (value === "") {
                            setPasswordLength(6);
                          }
                        }
                      }}
                      disabled={!isRandomPasswordActive}
                      className={cn(
                        "w-full bg-transparent text-sm font-normal font-['Roboto'] leading-4 outline-none text-center",
                        !isRandomPasswordActive ? "text-gray-300" : "text-gray-800"
                      )}
                    />
                  </div>
                  <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                    <span className={cn(
                      "text-[10px] font-normal font-['Roboto'] leading-4",
                      !isRandomPasswordActive ? "text-gray-400" : "text-gray-800"
                    )}>Password length</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePasswordLength(passwordLength - 1)}
                  disabled={!isRandomPasswordActive || passwordLength <= 6}
                  className={cn(
                    "w-10 h-10 p-2 rounded-lg outline outline-1 outline-gray-200 flex justify-center items-center shrink-0",
                    !isRandomPasswordActive || passwordLength <= 6
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updatePasswordLength(passwordLength + 1)}
                  disabled={!isRandomPasswordActive || passwordLength >= 32}
                  className={cn(
                    "w-10 h-10 p-2 rounded-lg outline outline-1 outline-gray-200 flex justify-center items-center shrink-0",
                    !isRandomPasswordActive || passwordLength >= 32
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-blue-100 outline-blue-100 text-primary-500 hover:bg-blue-200"
                  )}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Email for Receiving List */}
              <div className="flex-[1] relative flex flex-col">
                <div className="h-3.5"></div>
                <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-gray-200 flex items-center gap-3">
                  <input
                    type="email"
                    value={receiveEmail}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                      setReceiveEmail(sanitizedValue);
                    }}
                    placeholder="Insert email"
                    className="flex-1 bg-transparent text-gray-800 text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-gray-400"
                  />
                </div>
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                  <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Email for receiving list</span>
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



