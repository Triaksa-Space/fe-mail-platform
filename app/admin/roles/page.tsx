'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import PaginationComponent from "@/components/PaginationComponent";
import { ArrowUp, ArrowDown, UserPlus, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import LoadingProcessingPage from '@/components/ProcessLoading';
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import {
    AdminLayout,
    AdminRowActionMenu,
    PermissionChips,
    PermissionMultiSelect
} from "@/components/admin";
import {
    AdminUser,
    AdminListApiResponse,
    PermissionKey,
    formatDate,
} from "@/lib/admin-types";
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

type SortField = 'username' | 'last_active_at' | 'created_at';
type SortOrder = 'asc' | 'desc';

// Last Active Badge Component - matching user list style
const LastActiveBadge: React.FC<{ lastActiveAt: string | null; isOnline: boolean }> = ({
    lastActiveAt,
    isOnline,
}) => {
    // If online, show online badge
    if (isOnline) {
        return (
            <div className="h-5 px-1.5 py-0.5 bg-green-50 rounded-3xl flex justify-center items-center gap-1">
                <div className="text-center justify-center text-green-500 text-xs font-medium font-['Roboto'] leading-5">Online</div>
            </div>
        );
    }

    // Calculate time difference
    if (!lastActiveAt) {
        return (
            <div className="h-5 px-1.5 py-0.5 bg-gray-100 rounded-3xl flex justify-center items-center gap-1">
                <div className="text-center justify-center text-gray-700 text-xs font-medium font-['Roboto'] leading-5">-</div>
            </div>
        );
    }

    const now = new Date();
    const lastActiveDate = new Date(lastActiveAt);

    // Check for invalid date
    if (isNaN(lastActiveDate.getTime())) {
        return (
            <div className="h-5 px-1.5 py-0.5 bg-gray-100 rounded-3xl flex justify-center items-center gap-1">
                <div className="text-center justify-center text-gray-700 text-xs font-medium font-['Roboto'] leading-5">-</div>
            </div>
        );
    }

    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let badgeClass = "h-5 px-1.5 py-0.5 rounded-3xl flex justify-center items-center gap-1";
    let textClass = "text-center justify-center text-xs font-medium font-['Roboto'] leading-5";
    let displayText = "";

    if (diffMins < 5) {
        badgeClass += " bg-green-50";
        textClass += " text-green-500";
        displayText = "Online";
    } else if (diffMins < 60) {
        badgeClass += " bg-blue-100";
        textClass += " text-gray-700";
        displayText = `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        badgeClass += " bg-gray-100";
        textClass += " text-gray-700";
        displayText = `${diffHours} hours ago`;
    } else {
        badgeClass += " bg-gray-100";
        textClass += " text-gray-700";
        displayText = `${diffDays} days ago`;
    }

    return (
        <div className={badgeClass}>
            <div className={textClass}>{displayText}</div>
        </div>
    );
};

const RolesPermissionsPageContent: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const roleId = useAuthStore((state) => state.roleId);
    const [isLoading, setIsLoading] = useState(false);

    // Auth loading state
    const [authLoaded, setAuthLoaded] = useState(false);

    // Set page title
    useEffect(() => {
        document.title = "Roles & Permissions - Admin Mailria";
    }, []);

    // Create admin modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPermissions, setNewPermissions] = useState<PermissionKey[]>([]);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Delete confirmation modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

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

    // Fetch admins using the new API contract: GET /admin/admins
    const fetchAdmins = useCallback(async () => {
        try {
            setIsLoading(true);

            const params: Record<string, string | number> = {
                page: currentPage,
                limit: pageSize,
                sort_by: sortField,
                sort_dir: sortOrder,
            };

            if (searchQuery.trim()) {
                params.q = searchQuery.trim();
            }

            const response = await apiClient.get<AdminListApiResponse>("/admin/admins", {
                params,
            });

            if (!response.data || !response.data.data) {
                setAdmins([]);
                setTotalPages(1);
                setTotalCount(0);
                return;
            }

            // Map API response to frontend AdminUser type
            const data: AdminUser[] = response.data.data.map((admin) => ({
                id: admin.id,
                username: admin.username,
                last_active_at: admin.last_active_at,
                is_online: admin.is_online,
                permissions: admin.permissions,
                created_at: admin.created_at,
            }));

            setAdmins(data);
            setTotalPages(response.data.meta.total_pages);
            setTotalCount(response.data.meta.total_items);
        } catch (err) {
            console.error('Failed to fetch admins:', err);

            // Handle 403 Forbidden
            if (axios.isAxiosError(err) && err.response?.status === 403) {
                toast({
                    description: "You don't have permission to access this page.",
                    variant: "destructive",
                });
                router.replace("/admin");
                return;
            }

            // Show empty state for other errors
            setAdmins([]);
            setTotalPages(1);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, sortField, sortOrder, searchQuery, router, toast]);

    useEffect(() => {
        if (!authLoaded || roleId !== 0) return;

        const timeoutId = setTimeout(() => {
            fetchAdmins();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [authLoaded, token, currentPage, pageSize, sortField, sortOrder, searchQuery, roleId, fetchAdmins]);

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField === field && sortOrder === 'asc') {
            return <ArrowUp className="ml-1 h-4 w-4" />;
        } else if (sortField === field && sortOrder === 'desc') {
            return <ArrowDown className="ml-1 h-4 w-4" />;
        }
        return <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />;
    };

    const handleEditClick = (admin: AdminUser) => {
        router.push(`/admin/roles/${admin.id}/edit`);
    };

    const handleDeleteClick = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    // DELETE /admin/admins/:id
    const handleDeleteConfirm = async () => {
        if (!selectedAdmin) return;

        try {
            setIsLoading(true);
            await apiClient.delete(`/admin/admins/${selectedAdmin.id}`);

            toast({
                description: "Admin deleted successfully.",
                variant: "default",
            });

            setIsDeleteModalOpen(false);
            setSelectedAdmin(null);
            fetchAdmins();
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

    // POST /admin/admins
    const handleCreateAdmin = async () => {
        // Validation
        if (!newUsername.trim()) {
            toast({
                description: "Username is required.",
                variant: "destructive",
            });
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            toast({
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        if (newPermissions.length === 0) {
            toast({
                description: "At least one permission is required.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            await apiClient.post("/admin/admins", {
                username: newUsername.trim(),
                password: newPassword,
                permissions: newPermissions,
            });

            toast({
                description: "Admin created successfully.",
                variant: "default",
            });

            // Reset form and close modal
            setIsCreateModalOpen(false);
            setNewUsername('');
            setNewPassword('');
            setNewPermissions([]);
            fetchAdmins();
        } catch (error) {
            console.error('Failed to create admin:', error);
            let errorMessage = "Failed to create admin. Please try again.";
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

    const resetCreateForm = () => {
        setNewUsername('');
        setNewPassword('');
        setNewPermissions([]);
        setShowNewPassword(false);
    };

    // Check if user can create (button state)
    const canCreate = newUsername.trim() && newPassword.length >= 6 && newPermissions.length > 0;

    return (
        <AdminLayout>
            <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
                {/* Page Header */}
                <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
                        Roles & permissions
                    </div>
                </div>

                <Toaster />

                {/* Table Card */}
                <div className="self-stretch p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-start gap-4 overflow-visible relative">

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-gray-600 text-sm font-medium">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Header Row */}
                    <div className="self-stretch inline-flex justify-between items-center">
                        <div className="justify-center text-gray-800 text-lg font-medium font-['Roboto'] leading-7">
                            Admin list
                        </div>
                        <div className="flex justify-end items-center gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-10 px-4 py-2.5 btn-primary-skin flex justify-center items-center gap-1.5 transition-colors"
                            >
                                <UserPlus className="h-5 w-5 text-white" />
                                <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">
                                    Create admin
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 overflow-visible">
                            {/* Table Header */}
                            <div className="flex w-full bg-white border-b border-gray-200">
                                <div className="w-56 px-4 py-3 flex items-center gap-1">
                                    <button
                                        onClick={() => toggleSort('username')}
                                        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                                    >
                                        <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Username</div>
                                        {renderSortIcon('username')}
                                    </button>
                                </div>
                                <div className="w-40 px-4 py-3">
                                    <button
                                        onClick={() => toggleSort('last_active_at')}
                                        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                                    >
                                        <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Last active</div>
                                        {renderSortIcon('last_active_at')}
                                    </button>
                                </div>
                                <div className="flex-1 px-4 py-3 flex items-center gap-1">
                                    <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Role</div>
                                    <ChevronUpDownIcon className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="w-40 px-4 py-3">
                                    <button
                                        onClick={() => toggleSort('created_at')}
                                        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                                    >
                                        <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Created date</div>
                                        {renderSortIcon('created_at')}
                                    </button>
                                </div>
                                <div className="w-24 px-4 py-3 flex justify-center items-center">
                                    <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Action</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            {admins.length === 0 ? (
                                <div className="flex w-full bg-white border-b border-gray-200 px-4 py-3">
                                    <div className="text-gray-500 text-sm font-normal font-['Roboto'] leading-5">
                                        {isLoading ? "Loading..." : searchQuery ? "No admins found matching your search" : "No admins found"}
                                    </div>
                                </div>
                            ) : (
                                admins.map((admin) => (
                                    <div
                                        key={admin.id}
                                        className="flex w-full bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/roles/${admin.id}`)}
                                    >
                                        {/* Username */}
                                        <div className="w-56 px-4 py-3 flex items-center">
                                            <div className="text-gray-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {admin.username}
                                            </div>
                                        </div>
                                        {/* Last Active */}
                                        <div className="w-40 px-4 py-3 flex items-center">
                                            <LastActiveBadge
                                                lastActiveAt={admin.last_active_at}
                                                isOnline={admin.is_online}
                                            />
                                        </div>
                                        {/* Role/Permissions */}
                                        <div className="flex-1 px-4 py-3 flex items-center">
                                            <PermissionChips
                                                permissions={admin.permissions}
                                                className="max-w-[300px]"
                                            />
                                        </div>
                                        {/* Created Date */}
                                        <div className="w-40 px-4 py-3 flex items-center">
                                            <div className="text-gray-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {formatDate(admin.created_at)}
                                            </div>
                                        </div>
                {/* Action */}
                <div
                  className="w-24 px-4 py-3 flex justify-center items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AdminRowActionMenu
                    onEdit={() => handleEditClick(admin)}
                    onDelete={() => handleDeleteClick(admin)}
                  />
                </div>
              </div>
            ))
          )}
                        </div>

                        {/* Pagination */}
                        <div className="self-stretch">
                            <PaginationComponent
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                totalCount={totalCount}
                                activeCount={totalCount}
                                pageSize={pageSize}
                            />
                        </div>
                    </div>
                </div>

                {/* Create Admin Modal */}
                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={(open) => {
                        setIsCreateModalOpen(open);
                        if (!open) resetCreateForm();
                    }}
                >
                    <DialogContent className="w-96 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-center gap-4 overflow-hidden [&>button]:hidden">
                        {/* Header */}
                        <div className="self-stretch inline-flex justify-between items-center">
                            <div className="justify-center text-gray-800 text-base font-medium font-['Roboto'] leading-6">Create admin</div>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    resetCreateForm();
                                }}
                                className="w-10 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-800" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="w-full flex flex-col justify-start items-start gap-4">
                            <div className="self-stretch flex flex-col justify-start items-center gap-3">
                                {/* Username Input */}
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                    <div className="self-stretch relative flex flex-col justify-start items-start">
                                        <div className="self-stretch h-3.5"></div>
                                        <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                                            <input
                                                type="text"
                                                placeholder="Enter username"
                                                value={newUsername}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const sanitizedValue = DOMPurify.sanitize(value).replace(/[^a-zA-Z0-9_]/g, '');
                                                    setNewUsername(sanitizedValue);
                                                }}
                                                className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                            <div className="justify-center text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Username</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                    <div className="self-stretch relative flex flex-col justify-start items-start">
                                        <div className="self-stretch h-3.5"></div>
                                        <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                                            <div className="flex-1 flex justify-start items-center gap-2">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                                        setNewPassword(sanitizedValue);
                                                    }}
                                                    placeholder="***********"
                                                    className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="flex justify-center items-center"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="w-5 h-5 text-gray-800" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-800" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                            <div className="justify-center text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Password</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                                </div>

                                {/* Permissions */}
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                    <div className="self-stretch relative flex flex-col justify-start items-start">
                                        <div className="self-stretch h-3.5"></div>
                                        <PermissionMultiSelect
                                            value={newPermissions}
                                            onChange={(values) => setNewPermissions(values as PermissionKey[])}
                                        />
                                        <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5 z-10">
                                            <div className="justify-center text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Permissions</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Select at least one permission</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleCreateAdmin}
                                disabled={!canCreate}
                                className="self-stretch h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
                            >
                                <div className="text-center justify-center text-white text-base font-medium font-['Roboto'] leading-4">Create admin</div>
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

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
                                        <span className="text-gray-800 text-sm font-semibold font-['Roboto'] leading-5">{selectedAdmin?.username}?</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="self-stretch inline-flex justify-start items-center gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setSelectedAdmin(null);
                                    }}
                                    className="flex-1 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-center justify-center text-gray-700 text-base font-medium font-['Roboto'] leading-4">Cancel</div>
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 h-10 px-4 py-2.5 bg-red-500 rounded-lg shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-red-600 flex justify-center items-center gap-1.5 overflow-hidden hover:bg-red-600 transition-colors"
                                >
                                    <div className="text-center justify-center text-white text-base font-medium font-['Roboto'] leading-4">Delete</div>
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading && <LoadingProcessingPage />}
        </AdminLayout>
    );
};

const RolesPermissionsPage: React.FC = () => {
    return (
        <Suspense fallback={<div></div>}>
            <RolesPermissionsPageContent />
        </Suspense>
    );
};

export default RolesPermissionsPage;
