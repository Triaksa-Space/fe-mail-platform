'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import PasswordInput from '@/components/PasswordInput';
import LoadingProcessingPage from '@/components/ProcessLoading';
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import {
    AdminLayout,
    PermissionMultiSelect
} from "@/components/admin";
import { AdminUser, AdminApiResponse, PermissionKey } from "@/lib/admin-types";

const EditAdminPageContent: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const adminId = params?.id as string;

    const roleId = useAuthStore((state) => state.roleId);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Form state
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState<PermissionKey[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        setAuthLoaded(true);
    }, []);

    // Redirect logic
    useEffect(() => {
        if (!authLoaded) return;

        const storedToken = useAuthStore.getState().getStoredToken();
        if (!storedToken) {
            router.replace("/");
            return;
        }

        // Only SuperAdmin (roleId = 0) can access this page
        if (roleId !== 0) {
            router.replace("/admin");
        }
    }, [authLoaded, roleId, router]);

    // Fetch admin data: GET /admin/admins/:id
    const fetchAdmin = useCallback(async () => {
        if (!adminId) return;

        try {
            setIsFetching(true);
            const response = await apiClient.get<AdminApiResponse>(`/admin/admins/${adminId}`);

            if (response.data) {
                const adminData: AdminUser = {
                    id: response.data.id,
                    username: response.data.username,
                    last_active_at: response.data.last_active_at,
                    is_online: response.data.is_online,
                    permissions: response.data.permissions,
                    created_at: response.data.created_at,
                };
                setAdmin(adminData);
                setUsername(adminData.username);
                setPermissions(adminData.permissions);
            }
        } catch (error) {
            console.error('Failed to fetch admin:', error);

            // Handle 403 Forbidden
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                toast({
                    description: "You don't have permission to access this page.",
                    variant: "destructive",
                });
                router.replace("/admin");
                return;
            }

            toast({
                description: "Failed to load admin data.",
                variant: "destructive",
            });
            router.replace("/admin/roles");
        } finally {
            setIsFetching(false);
        }
    }, [adminId, router, toast]);

    useEffect(() => {
        if (!authLoaded || roleId !== 0) return;
        fetchAdmin();
    }, [authLoaded, roleId, adminId, fetchAdmin]);

    // PUT /admin/admins/:id
    const handleSave = async () => {
        // Validation
        if (!username.trim()) {
            toast({
                description: "Username is required.",
                variant: "destructive",
            });
            return;
        }

        if (password && password.length < 6) {
            toast({
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        if (permissions.length === 0) {
            toast({
                description: "At least one permission is required.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            const payload: {
                username: string;
                permissions: PermissionKey[];
                password?: string;
            } = {
                username: username.trim(),
                permissions: permissions,
            };

            // Only include password if it was changed
            if (password) {
                payload.password = password;
            }

            await apiClient.put(`/admin/admins/${admin?.id}`, payload);

            toast({
                description: "Admin updated successfully.",
                variant: "default",
            });

            router.push("/admin/roles");
        } catch (error) {
            console.error('Failed to update admin:', error);
            let errorMessage = "Failed to update admin. Please try again.";
            if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            }
            toast({
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push("/admin/roles");
    };

    // Check if form is valid
    const isFormValid = username.trim() && permissions.length > 0 && (!password || password.length >= 6);

    if (isFetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Toaster />

            {/* Breadcrumb Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={() => router.push("/admin/roles")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Roles & permissions</span>
                    </button>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">{admin?.username}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">Edit</span>
                </div>
            </div>

            {/* Form Card */}
            <div
                className={cn(
                    "rounded-xl bg-white p-4 md:p-6 border border-gray-100",
                    "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]"
                )}
            >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Edit admin
                </h2>

                {/* Form Fields - 3 columns on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Username */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <Input
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => {
                                const value = e.target.value;
                                const sanitizedValue = DOMPurify.sanitize(value).replace(/[^a-zA-Z0-9_]/g, '');
                                setUsername(sanitizedValue);
                            }}
                            className="bg-gray-50 border-gray-200 focus:bg-white"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <PasswordInput
                            id="edit_password"
                            placeholder="Leave empty to keep current"
                            value={password}
                            onChange={(e) => {
                                const value = e.target.value;
                                const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                setPassword(sanitizedValue);
                            }}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />
                        <p className="text-xs text-gray-500">
                            Leave empty to keep current password
                        </p>
                    </div>

                    {/* Role / Permissions */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <PermissionMultiSelect
                            value={permissions}
                            onChange={(values) => setPermissions(values as PermissionKey[])}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={cn(
                            "px-6",
                            !isFormValid
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                    >
                        Save changes
                    </Button>
                </div>
            </div>

            {isLoading && <LoadingProcessingPage />}
        </AdminLayout>
    );
};

const EditAdminPage: React.FC = () => {
    return (
        <Suspense fallback={<div></div>}>
            <EditAdminPageContent />
        </Suspense>
    );
};

export default EditAdminPage;
