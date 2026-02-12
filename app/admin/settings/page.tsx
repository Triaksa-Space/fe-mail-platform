'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import { Eye, EyeOff, Check } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin";
import { LockClosedIcon } from "@heroicons/react-v1/outline"
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";

// Loading fallback component
const LoadingFallback: React.FC = () => (
    <AdminLoadingPlaceholder heightClassName="h-64" />
);

// ============================================
// CHANGE PASSWORD COMPONENT
// For both SuperAdmin (roleId === 0) and Admin (roleId === 2)
// ============================================
const ChangePasswordSection: React.FC = () => {
    const { toast } = useToast();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid = oldPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6;

    // API: PUT /user/change_password/admin (existing endpoint)
    const handleChangePassword = async () => {
        if (!isFormValid) return;

        if (newPassword !== confirmPassword) {
            toast({
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            await apiClient.put("/user/change_password/admin", {
                new_password: newPassword,
                old_password: oldPassword,
                user_id: 0 // 0 indicates self
            });

            toast({
                description: "Password changed successfully.",
                variant: "default",
            });

            // Clear form
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            let errorMessage = "Failed to change password. Please try again.";
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                errorMessage = error.response.data.message;
            }
            toast({
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
            {/* Page Header */}
            <div className="self-stretch inline-flex justify-start items-center gap-5">
                <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
                    Settings
                </div>
            </div>

            {/* Change Password Card */}
            <div className="self-stretch p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-center text-neutral-800 text-lg font-medium font-['Roboto'] leading-7">
                    Change password
                </div>

                {/* Password Inputs Row */}
                <div className="self-stretch inline-flex justify-start items-start gap-4">
                    {/* Old Password */}
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch relative flex flex-col justify-start items-start">
                            <div className="self-stretch h-3.5"></div>
                            <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3">
                                <div className="flex-1 flex justify-start items-center gap-2">
                                    <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                            setOldPassword(sanitizedValue);
                                        }}
                                        placeholder="***********"
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="h-auto flex justify-center items-center"
                                >
                                    {showOldPassword ? (
                                        <EyeOff className="w-5 h-5 text-neutral-800" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-neutral-800" />
                                    )}
                                </Button>
                            </div>
                            <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                <span className="justify-center text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Old password</span>
                            </div>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch relative flex flex-col justify-start items-start">
                            <div className="self-stretch h-3.5"></div>
                            <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3">
                                <div className="flex-1 flex justify-start items-center gap-2">
                                    <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                            setNewPassword(sanitizedValue);
                                        }}
                                        placeholder="***********"
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="h-auto flex justify-center items-center"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-5 h-5 text-neutral-800" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-neutral-800" />
                                    )}
                                </Button>
                            </div>
                            <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                <span className="justify-center text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">New password</span>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch relative flex flex-col justify-start items-start">
                            <div className="self-stretch h-3.5"></div>
                            <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3">
                                <div className="flex-1 flex justify-start items-center gap-2">
                                    <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                            setConfirmPassword(sanitizedValue);
                                        }}
                                        placeholder="***********"
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="h-auto flex justify-center items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5 text-neutral-800" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-neutral-800" />
                                    )}
                                </Button>
                            </div>
                            <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                <span className="justify-center text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Confirm password</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-300"></div>

                {/* Submit Button */}
                <div className="self-stretch inline-flex justify-end items-start gap-2.5">
                    <Button
                        onClick={handleChangePassword}
                        disabled={!isFormValid || isLoading}
                        className="h-10 px-4 py-2.5 btn-primary-skin flex justify-center items-center gap-1.5 transition-colors"
                    >
                        <Check className={cn(
                            "w-5 h-5",
                            isFormValid && !isLoading ? "text-white" : "text-white"
                        )} />
                        <span className={cn(
                            "text-center text-base font-medium font-['Roboto'] leading-4",
                            isFormValid && !isLoading ? "text-white" : "text-white"
                        )}>
                            {isLoading ? "Changing..." : "Change password"}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// MAIN SETTINGS PAGE COMPONENT
// Both SuperAdmin and Admin see the same change password page
// Admin user list management is now in Roles & Permissions
// ============================================
const SettingsPageContent: React.FC = () => {
    const router = useRouter();
    const roleId = useAuthStore((state) => state.roleId);
    const storedToken = useAuthStore.getState().getStoredToken();

    // Authentication loaded state
    const [authLoaded, setAuthLoaded] = useState(false);

    useEffect(() => {
        setAuthLoaded(true);
    }, []);

    // Set page title
    useEffect(() => {
        document.title = "Settings - Admin Mailria";
    }, []);

    // Redirect users based on authentication and role
    useEffect(() => {
        if (!authLoaded) return;

        if (!storedToken) {
            router.replace("/");
            return;
        }

        // Regular user (roleId === 1) not allowed
        if (roleId === 1) {
            router.replace("/not-found");
        }
    }, [authLoaded, storedToken, roleId, router]);

    if (!authLoaded || roleId === 1) {
        return <LoadingFallback />;
    }

    return (
        <AdminLayout>
            <Toaster />
            <ChangePasswordSection />
        </AdminLayout>
    );
};

// Wrap with Suspense
const SettingsPage: React.FC = () => (
    <Suspense fallback={<LoadingFallback />}>
        <SettingsPageContent />
    </Suspense>
);

export default SettingsPage;
