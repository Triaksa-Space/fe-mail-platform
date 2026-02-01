'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Key, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import { AdminLayout, AdminContentCard } from "@/components/admin";

// Loading fallback component
const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-full"></div>
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

    const isFormValid = oldPassword && newPassword && confirmPassword && newPassword === confirmPassword;

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

    return (
        <div className="flex flex-col gap-5">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your account settings</p>
            </div>

            {/* Change Password Card */}
            <AdminContentCard>
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                    <p className="mt-1 text-sm text-gray-500">Update your account password</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Old Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                    setOldPassword(sanitizedValue);
                                }}
                                placeholder="Enter current password"
                                className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                    setNewPassword(sanitizedValue);
                                }}
                                placeholder="Enter new password"
                                className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                    setConfirmPassword(sanitizedValue);
                                }}
                                placeholder="Confirm new password"
                                className={cn(
                                    "pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400",
                                    confirmPassword && newPassword !== confirmPassword && "border-red-300 focus:border-red-400 focus:ring-red-200"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500">Passwords do not match</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleChangePassword}
                        disabled={!isFormValid || isLoading}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-colors",
                            isFormValid && !isLoading
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        <Key className="h-4 w-4" />
                        {isLoading ? "Changing..." : "Change Password"}
                    </button>
                </div>
            </AdminContentCard>
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
