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
import { Button } from "@/components/ui/button";
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";
import { useRequirePermission } from "@/hooks/use-require-permission";

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
  <div className={cn("h-10 min-w-0 flex justify-start items-center gap-1", className)}>
    <Button
      variant="ghost"
      type="button"
      onClick={onChange}
      className="w-10 h-6 p-0 relative"
    >
      <div className={cn(
        "w-10 h-6 rounded-3xl transition-colors",
        active ? "bg-primary-500" : "bg-neutral-200"
      )}></div>
      <div className={cn(
        "w-5 h-5 absolute top-[1.5px] bg-white rounded-full transition-all",
        active ? "left-[18.5px]" : "left-[1.5px]"
      )}></div>
    </Button>
    <span className="text-neutral-800 text-sm font-normal font-['Roboto'] leading-4">{label}</span>
  </div>
);

const CreateBulkEmailPageContent: React.FC = () => {
  const { allowed } = useRequirePermission("create_bulk");
  const [selectedDomain, setSelectedDomain] = useState(() =>
    typeof window !== "undefined" && window.location.hostname.includes("staging")
      ? "staging.mailria.com"
      : "mailria.com"
  )
  const [count, setCount] = useState(2)
  const [password, setPassword] = useState("")
  const [baseName, setBaseName] = useState("")
  const [passwordLength, setPasswordLength] = useState(6)
  const { toast } = useToast()
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const storedToken = useAuthStore.getState().getStoredToken();

  const [countInput, setCountInput] = useState("2")
  const [passwordLengthInput, setPasswordLengthInput] = useState("6")
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
      setCountInput(String(newCount))
    }
  }

  const updatePasswordLength = (newLength: number) => {
    if (newLength >= 6 && newLength <= 32) {
      setPasswordLength(newLength)
      setPasswordLengthInput(String(newLength))
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
        title: `${count} email created successfully.`,
        description: (
          <>
            {count} email created successfully.
            <br />
            Email list has been send to {receiveEmail}
          </>
        ),
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

  if (!allowed) return null;

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full self-stretch">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-start items-center gap-5">
          <div className="text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Create Bulk
          </div>
        </div>

        {/* Form Card */}
        <AdminContentCard className="w-full p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Rows: Email + Domain + Quantity | Password + Password length + Receive email */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_max-content_minmax(0,1.35fr)_40px_40px_minmax(0,1.15fr)_40px_40px] lg:items-end">
              <div className="relative min-w-0 flex flex-col">
                <div className="h-3.5"></div>
                <div className={cn(
                  "h-10 px-3 py-2 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-neutral-200 flex items-center gap-3",
                  isRandomNameActive ? "bg-neutral-100" : "bg-white"
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
                      "flex-1 bg-transparent text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-neutral-400",
                      isRandomNameActive ? "text-neutral-400" : "text-neutral-800"
                    )}
                  />
                </div>
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                  <span className={cn(
                    "text-[10px] font-normal font-['Roboto'] leading-4",
                    isRandomNameActive ? "text-neutral-400" : "text-neutral-800"
                  )}>Email</span>
                </div>
              </div>

              <ToggleSwitch
                active={isRandomNameActive}
                onChange={toggleRandomName}
                label="Random email"
                className="whitespace-nowrap"
              />

              <div className="relative min-w-0 flex flex-col lg:col-span-3">
                <div className="h-3.5"></div>
                <DomainSelector
                  value={selectedDomain}
                  onChange={(value) => setSelectedDomain(value)}
                  className="h-10 w-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-neutral-200 text-neutral-800 text-sm font-normal font-['Roboto'] [&>button]:h-full [&>button]:border-0 [&>button]:shadow-none [&>button]:ring-0 [&>button]:rounded-lg"
                />
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center z-10">
                  <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Domain</span>
                </div>
              </div>

              <div className="relative min-w-0 flex flex-col">
                <div className="h-3.5"></div>
                <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-neutral-200 flex items-center justify-center gap-3">
                  <input
                    type="text"
                    value={countInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setCountInput(value);
                        const numericValue = parseInt(value, 10);
                        if (!isNaN(numericValue) && numericValue >= 2 && numericValue <= 100) {
                          setCount(numericValue);
                        }
                      }
                    }}
                    onBlur={() => {
                      const numericValue = parseInt(countInput, 10);
                      if (!countInput || isNaN(numericValue) || numericValue < 2) {
                        setCount(2);
                        setCountInput("2");
                      } else if (numericValue > 100) {
                        setCount(100);
                        setCountInput("100");
                      }
                    }}
                    className="w-full bg-transparent text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 outline-none text-center"
                  />
                </div>
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                  <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4 whitespace-nowrap">Quantity (minimum 2, maximum 100)</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => updateCount(count - 1)}
                disabled={count <= 2}
                className={cn(
                  "w-10 h-10 p-2 rounded-lg border border-primary-100 bg-primary-50 disabled:border-neutral-200 disabled:bg-neutral-100 flex justify-center items-center gap-1 shrink-0 disabled:opacity-100",
                  count <= 2
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-primary-500 hover:bg-neutral-200"
                )}
              >
                <MinusIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => updateCount(count + 1)}
                disabled={count >= 100}
                className={cn(
                  "w-10 h-10 p-2 rounded-lg border border-primary-100 bg-primary-50 flex justify-center items-center gap-1 shrink-0",
                  count >= 100
                    ? "border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed"
                    : "text-primary-500 hover:bg-primary-100"
                )}
              >
                <PlusIcon className="w-5 h-5" />
              </Button>

            {/* Row 2: Same password + Random toggle | Password length + buttons | Email for receiving */}
              <div className="relative min-w-0 flex flex-col">
                <div className="h-3.5"></div>
                <div className={cn(
                  "h-10 px-3 py-2 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-neutral-200 flex items-center gap-3",
                  isRandomPasswordActive ? "bg-neutral-100" : "bg-white"
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
                      "flex-1 bg-transparent text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-neutral-400",
                      isRandomPasswordActive ? "text-neutral-400" : "text-neutral-800"
                    )}
                  />
                </div>
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                  <span className={cn(
                    "text-[10px] font-normal font-['Roboto'] leading-4",
                    isRandomPasswordActive ? "text-neutral-400" : "text-neutral-800"
                  )}>Same password</span>
                </div>
              </div>

              <ToggleSwitch
                active={isRandomPasswordActive}
                onChange={toggleRandomPassword}
                label="Random pass"
                className="whitespace-nowrap"
              />

              <div className="min-w-0 flex items-end gap-4 lg:col-span-3">
                <div className="relative flex-1 flex flex-col">
                  <div className="h-3.5"></div>
                  <div className={cn(
                    "h-10 px-3 py-2 rounded-lg outline outline-1 outline-neutral-200 flex items-center justify-center gap-3 overflow-hidden",
                    !isRandomPasswordActive ? "bg-neutral-100" : "bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]"
                  )}>
                    <input
                      type="text"
                      value={passwordLengthInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setPasswordLengthInput(value);
                          const numericValue = parseInt(value, 10);
                          if (!isNaN(numericValue) && numericValue >= 6 && numericValue <= 32) {
                            setPasswordLength(numericValue);
                          }
                        }
                      }}
                      onBlur={() => {
                        const numericValue = parseInt(passwordLengthInput, 10);
                        if (!passwordLengthInput || isNaN(numericValue) || numericValue < 6) {
                          setPasswordLength(6);
                          setPasswordLengthInput("6");
                        } else if (numericValue > 32) {
                          setPasswordLength(32);
                          setPasswordLengthInput("32");
                        }
                      }}
                      disabled={!isRandomPasswordActive}
                      className={cn(
                        "w-full bg-transparent text-sm font-normal font-['Roboto'] leading-4 outline-none text-center",
                        !isRandomPasswordActive ? "text-neutral-300" : "text-neutral-800"
                      )}
                    />
                  </div>
                  <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                    <span className={cn(
                      "text-[10px] font-normal font-['Roboto'] leading-4",
                      !isRandomPasswordActive ? "text-neutral-400" : "text-neutral-800"
                    )}>Password length</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => updatePasswordLength(passwordLength - 1)}
                  disabled={!isRandomPasswordActive || passwordLength <= 6}
                  className={cn(
                    "w-10 h-10 p-2 rounded-lg border border-primary-100 bg-primary-50 disabled:border-neutral-200 disabled:bg-neutral-100 flex justify-center items-center gap-1 shrink-0 disabled:opacity-100",
                  count <= 2
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-primary-500 hover:bg-neutral-200"
                  )}
                >
                  <MinusIcon className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => updatePasswordLength(passwordLength + 1)}
                  disabled={!isRandomPasswordActive || passwordLength >= 32}
                  className={cn(
                    "w-10 h-10 p-2 rounded-lg border border-primary-100 bg-primary-50 flex justify-center items-center gap-1 shrink-0 disabled:opacity-100",
                    !isRandomPasswordActive || passwordLength >= 32
                      ? "border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed"
                      : "text-primary-500 hover:bg-primary-100"
                  )}
                >
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative min-w-0 flex flex-col lg:col-span-3">
                <div className="h-3.5"></div>
                <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-neutral-200 flex items-center gap-3">
                  <input
                    type="email"
                    value={receiveEmail}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                      setReceiveEmail(sanitizedValue);
                    }}
                    placeholder="Insert email"
                    className="flex-1 bg-transparent text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="px-1 absolute left-2 top-1 bg-white inline-flex justify-center items-center">
                  <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Email for receiving list</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-neutral-300"></div>

            {/* Submit Button - Right Aligned */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-base font-medium font-['Roboto'] leading-4">Create email</span>
              </Button>
            </div>
          </form>
        </AdminContentCard>
      </div>

      {/* Loading Indicator */}
      {isLoading && <LoadingProcessingPage message={`Creating ${count} accounts...`} />}
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
