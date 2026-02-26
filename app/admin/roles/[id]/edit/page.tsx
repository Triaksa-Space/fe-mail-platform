'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import { Check } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import LoadingProcessingPage from '@/components/ProcessLoading';
import DOMPurify from 'dompurify';
import {
    AdminLayout,
    RolePermissionDropdown
} from "@/components/admin";
import { AdminUser, AdminApiResponse, PermissionKey } from "@/lib/admin-types";
import { UserIcon, ArrowLeftIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";

const EditAdminPageContent: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const adminId = params?.id as string;
    const from = searchParams.get('from');
    const backPath = from === 'list' ? '/admin/roles' : `/admin/roles/${adminId}`;

    const roleId = useAuthStore((state) => state.roleId);
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Form state
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [permissions, setPermissions] = useState<PermissionKey[]>([]);

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

        if (!hasPermission('roles_permissions')) {
            router.replace("/admin");
        }
    }, [authLoaded, roleId, hasPermission, router]);

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
                    password: response.data.password,
                    last_active_at: response.data.last_active_at,
                    is_online: response.data.is_online,
                    permissions: response.data.permissions,
                    created_at: response.data.created_at,
                };
                setAdmin(adminData);
                setUsername(adminData.username);
                setPassword(adminData.password || '');
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
        if (!authLoaded || !hasPermission('roles_permissions')) return;
        fetchAdmin();
    }, [authLoaded, roleId, hasPermission, adminId, fetchAdmin]);

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
                description: "Data changed successfully.",
                variant: "default",
            });

            router.push(`/admin/roles/${adminId}`);
        } catch (error) {
            console.error('Failed to update admin:', error);
            let errorMessage = "Failed to update admin. Please try again.";
            if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
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

    const handleCancel = () => {
        router.push(backPath);
    };

    // Check if form is valid
    const isFormValid = username.trim() && permissions.length > 0 && (!password || password.length >= 6);

    if (isFetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-neutral-600 text-sm font-medium">Loading...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Toaster />
            <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
                {/* Breadcrumb Navigation */}
                <div className="h-5 inline-flex justify-start items-center gap-1">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(backPath)}
                        className="w-8 h-8 p-1 rounded flex justify-center items-center gap-1 overflow-hidden hover:bg-neutral-100 transition-colors h-auto"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-neutral-600" />
                    </Button>
                    <ChevronRightIcon className="w-5 h-5 text-neutral-300" />

                    {/* Roles & permissions link */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/admin/roles")}
                        className="flex justify-center items-center gap-1 hover:bg-neutral-100 rounded px-1 transition-colors h-auto"
                    >
                        <KeyIcon className="w-5 h-5 text-neutral-600" />
                        <span className="text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">Roles & permissions</span>
                    </Button>
                    <ChevronRightIcon className="w-5 h-5 text-neutral-300" />

                    {/* Admin username link */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/admin/roles/${adminId}`)}
                        className="flex justify-center items-center gap-1 hover:bg-neutral-100 rounded px-1 transition-colors h-auto"
                    >
                        <UserIcon className="w-5 h-5 text-neutral-600" />
                        <span className="text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">{admin?.username}</span>
                    </Button>
                    <ChevronRightIcon className="w-5 h-5 text-neutral-300" />

                    {/* Current page - Edit */}
                    <div className="flex justify-center items-center gap-1">
                        <PencilSquareIcon className="w-5 h-5 text-primary-500" />
                        <span className="text-primary-500 text-sm font-normal font-['Roboto'] leading-4">Edit</span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
                        Edit
                    </div>
                </div>

                {/* Form Card */}
                <div className="self-stretch p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-start gap-4 overflow-visible">
                    {/* Form Fields Row */}
                    <div className="self-stretch inline-flex justify-start items-start gap-4">
                        {/* Username Input */}
                        <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sanitizedValue = DOMPurify.sanitize(value).replace(/[^a-zA-Z0-9_]/g, '');
                                            setUsername(sanitizedValue);
                                        }}
                                        placeholder="Enter username"
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-400"
                                    />
                                </div>
                                <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                    <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Username</span>
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                            setPassword(sanitizedValue);
                                        }}
                                        placeholder="Enter new password"
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                    <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Password</span>
                                </div>
                            </div>
                        </div>

                        {/* Role Select */}
                        <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <RolePermissionDropdown
                                    value={permissions}
                                    onChange={(values) => setPermissions(values as PermissionKey[])}
                                />
                                <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5 z-10">
                                    <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Role</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-300"></div>

                    {/* Action Buttons */}
                    <div className="self-stretch inline-flex justify-end items-start gap-2.5">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-neutral-50 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-neutral-800" />
                            <span className="text-center text-neutral-700 text-base font-medium font-['Roboto'] leading-4">Cancel</span>
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!isFormValid}
                            className="h-10 px-4 py-2.5 btn-primary-skin flex justify-center items-center gap-1.5 transition-colors"
                        >
                            <Check className="w-5 h-5 text-white" />
                            <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">Save changes</span>
                        </Button>
                    </div>
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



