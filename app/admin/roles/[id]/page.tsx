'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import { Shield, AlertTriangle } from 'lucide-react';
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import LoadingProcessingPage from '@/components/ProcessLoading';
import {
    AdminLayout,
    PermissionChips
} from "@/components/admin";
import { AdminUser, AdminApiResponse } from "@/lib/admin-types";
import { PencilSquareIcon, TrashIcon, UserIcon, ArrowLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ViewAdminPageContent: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const adminId = params?.id as string;

    const roleId = useAuthStore((state) => state.roleId);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Admin data
    const [admin, setAdmin] = useState<AdminUser | null>(null);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
                    password: response.data.password,
                };
                setAdmin(adminData);
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

    // Handle edit click
    const handleEditClick = () => {
        router.push(`/admin/roles/${adminId}/edit`);
    };

    // Handle delete
    const handleDeleteConfirm = async () => {
        if (!admin) return;

        try {
            setIsLoading(true);
            await apiClient.delete(`/admin/admins/${admin.id}`);

            toast({
                description: "Admin deleted successfully.",
                variant: "default",
            });

            setIsDeleteModalOpen(false);
            router.push("/admin/roles");
        } catch (error) {
            console.error('Failed to delete admin:', error);
            let errorMessage = "Failed to delete admin. Please try again.";
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

    if (isFetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-600 text-sm font-medium">Loading...</span>
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
                    <button
                        onClick={() => router.push("/admin/roles")}
                        className="w-8 h-8 p-1 rounded flex justify-center items-center gap-1 overflow-hidden hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <ChevronRightIcon className="w-5 h-5 text-gray-300" />

                    {/* Roles & permissions link */}
                    <button
                        onClick={() => router.push("/admin/roles")}
                        className="flex justify-center items-center gap-1 hover:bg-gray-100 rounded px-1 transition-colors"
                    >
                        <Shield className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-sm font-normal font-['Roboto'] leading-4">Roles & permissions</span>
                    </button>
                    <ChevronRightIcon className="w-5 h-5 text-gray-300" />

                    {/* Current admin */}
                    <div className="flex justify-center items-center gap-1">
                        <UserIcon className="w-5 h-5 text-sky-600" />
                        <span className="text-sky-600 text-sm font-normal font-['Roboto'] leading-4">{admin?.username}</span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
                        View admin
                    </div>
                    <div className="flex justify-end items-center gap-3">
                        {/* Edit Button */}
                        <button
                            onClick={handleEditClick}
                            className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors"
                        >
                            <PencilSquareIcon className="w-5 h-5 text-gray-800" />
                            <span className="text-center text-gray-700 text-base font-medium font-['Roboto'] leading-4">Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-red-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-red-50 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5 text-red-500" />
                            <span className="text-center text-red-500 text-base font-medium font-['Roboto'] leading-4">Delete</span>
                        </button>
                    </div>
                </div>

                {/* Admin Details Card */}
                <div className="self-stretch p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-start gap-4 overflow-hidden">
                    {/* Username & Password Row */}
                    <div className="self-stretch inline-flex justify-start items-start gap-4">
                        {/* Username - Disabled Input */}
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <div className="self-stretch h-10 px-3 py-2 bg-gray-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                                    <div className="flex-1 flex justify-start items-center gap-2">
                                        <span className="text-gray-400 text-sm font-normal font-['Roboto'] leading-4">
                                            {admin?.username}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                    <span className="text-gray-400 text-[10px] font-normal font-['Roboto'] leading-4">Username</span>
                                </div>
                            </div>
                        </div>

                        {/* Password - Disabled Input */}
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <div className="self-stretch h-10 px-3 py-2 bg-gray-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                                    <div className="flex-1 flex justify-start items-center gap-2">
                                        <span className="text-gray-400 text-sm font-normal font-['Roboto'] leading-4">
                                            {admin?.password}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                    <span className="text-gray-400 text-[10px] font-normal font-['Roboto'] leading-4">Password</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Section */}
                    <div className="flex flex-col justify-start items-start gap-1">
                        <span className="text-gray-700 text-[10px] font-normal font-['Roboto'] leading-4">Role</span>
                        <PermissionChips
                            permissions={admin?.permissions || []}
                            className="flex-wrap"
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="w-96 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-center overflow-hidden gap-0 [&>button]:hidden">
                    <div className="self-stretch relative flex flex-col justify-start items-center gap-8">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="w-5 h-5 absolute right-0 top-0 overflow-hidden flex items-center justify-center hover:opacity-70 transition-opacity"
                        >
                            <XMarkIcon className="w-4 h-4 text-gray-800" />
                        </button>

                        <div className="self-stretch flex flex-col justify-start items-center gap-5">
                            {/* Icon */}
                            <div className="w-12 h-12 p-2 bg-red-50 rounded-3xl inline-flex justify-center items-center gap-2.5">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>

                            {/* Title & Description */}
                            <div className="self-stretch flex flex-col justify-start items-center gap-2">
                                <div className="self-stretch text-center justify-center text-gray-900 text-lg font-medium font-['Roboto'] leading-7">
                                    Delete admin?
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-center text-center">
                                    <span className="text-gray-500 text-sm font-normal font-['Roboto'] leading-5">Are you sure you want to delete</span>
                                    <span className="text-gray-800 text-sm font-semibold font-['Roboto'] leading-5">{admin?.username}?</span>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="self-stretch inline-flex justify-start items-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-center text-gray-700 text-base font-medium font-['Roboto'] leading-4">Cancel</span>
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 h-10 px-4 py-2.5 bg-red-500 rounded-lg shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-red-600 flex justify-center items-center gap-1.5 overflow-hidden hover:bg-red-600 transition-colors"
                            >
                                <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">Delete</span>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {isLoading && <LoadingProcessingPage />}
        </AdminLayout>
    );
};

const ViewAdminPage: React.FC = () => {
    return (
        <Suspense fallback={<div></div>}>
            <ViewAdminPageContent />
        </Suspense>
    );
};

export default ViewAdminPage;
