'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/PaginationComponent";
import { ArrowUp, ArrowDown, ArrowUpDown, UserPlus, Search } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import PasswordInput from '@/components/PasswordInput';
import LoadingProcessingPage from '@/components/ProcessLoading';
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import {
    AdminLayout,
    AdminContentCard,
    AdminRowActionMenu,
    PermissionChips,
    PermissionMultiSelect
} from "@/components/admin";
import {
    AdminUser,
    AdminListApiResponse,
    PermissionKey,
    formatLastActive,
    formatDate,
} from "@/lib/admin-types";

type SortField = 'username' | 'last_active_at' | 'created_at';
type SortOrder = 'asc' | 'desc';

// Last active status badge component
const LastActiveBadge: React.FC<{ lastActiveAt: string | null; isOnline: boolean }> = ({
    lastActiveAt,
    isOnline,
}) => {
    const { text, variant } = formatLastActive(lastActiveAt, isOnline);

    const variantStyles = {
        online: 'bg-green-50 text-green-700 border-green-100',
        recent: 'bg-blue-50 text-blue-700 border-blue-100',
        away: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5",
                "text-xs font-medium border",
                variantStyles[variant]
            )}
        >
            {variant === 'online' && (
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
            )}
            {text}
        </span>
    );
};

// Skeleton row for loading state
const SkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
        </td>
        <td className="px-4 py-4">
            <div className="h-6 w-20 rounded-full bg-gray-200" />
        </td>
        <td className="px-4 py-4">
            <div className="flex flex-wrap gap-1.5">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
                <div className="h-5 w-14 rounded-full bg-gray-200" />
            </div>
        </td>
        <td className="px-4 py-4">
            <div className="h-4 w-24 rounded bg-gray-200" />
        </td>
        <td className="px-4 md:px-6 py-4 text-right">
            <div className="h-9 w-9 rounded-lg bg-gray-200 ml-auto" />
        </td>
    </tr>
);

const RolesPermissionsPageContent: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
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
        return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
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

    // Calculate pagination text
    const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalCount);

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Roles & permissions</h1>
            </div>

            <AdminContentCard
                title="Admin list"
                headerRight={
                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by username..."
                                value={searchQuery}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitizedValue = DOMPurify.sanitize(value);
                                    setSearchQuery(sanitizedValue);
                                }}
                                className="pl-9 w-48 sm:w-64 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                        {/* Create Button */}
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create admin
                        </Button>
                    </div>
                }
            >
                <Toaster />

                {/* Table */}
                <div className="overflow-x-auto -mx-4 md:-mx-6">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => toggleSort('username')}
                                        className="flex items-center hover:text-gray-900 transition-colors"
                                    >
                                        Username
                                        {renderSortIcon('username')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => toggleSort('last_active_at')}
                                        className="flex items-center hover:text-gray-900 transition-colors"
                                    >
                                        Last Active
                                        {renderSortIcon('last_active_at')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => toggleSort('created_at')}
                                        className="flex items-center hover:text-gray-900 transition-colors"
                                    >
                                        Created
                                        {renderSortIcon('created_at')}
                                    </button>
                                </th>
                                <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading && admins.length === 0 ? (
                                // Skeleton loading state
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 md:px-6 py-12 text-center">
                                        <div className="space-y-3">
                                            <p className="text-gray-500">
                                                {searchQuery ? 'No admins found matching your search' : 'No admins found'}
                                            </p>
                                            {!searchQuery && (
                                                <Button
                                                    onClick={() => setIsCreateModalOpen(true)}
                                                    variant="outline"
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Create admin
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr
                                        key={admin.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                                                    {admin.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {admin.username}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <LastActiveBadge
                                                lastActiveAt={admin.last_active_at}
                                                isOnline={admin.is_online}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <PermissionChips
                                                permissions={admin.permissions}
                                                className="max-w-[280px]"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {formatDate(admin.created_at)}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right">
                                            <AdminRowActionMenu
                                                onEdit={() => handleEditClick(admin)}
                                                onDelete={() => handleDeleteClick(admin)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalCount > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex} to {endIndex} of {totalCount} results
                            </p>
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
                )}

                {/* Create Admin Modal */}
                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={(open) => {
                        setIsCreateModalOpen(open);
                        if (!open) resetCreateForm();
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create admin</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <Input
                                    placeholder="Enter username"
                                    value={newUsername}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/[^a-zA-Z0-9_]/g, '');
                                        setNewUsername(sanitizedValue);
                                    }}
                                    className="bg-gray-50 border-gray-200 focus:bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <PasswordInput
                                    id="new_password"
                                    placeholder="Enter password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                        setNewPassword(sanitizedValue);
                                    }}
                                    showPassword={showNewPassword}
                                    setShowPassword={setShowNewPassword}
                                />
                                <p className="text-xs text-gray-500">Minimum 6 characters</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Permissions
                                </label>
                                <PermissionMultiSelect
                                    value={newPermissions}
                                    onChange={(values) => setNewPermissions(values as PermissionKey[])}
                                />
                                <p className="text-xs text-gray-500">Select at least one permission</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    resetCreateForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={cn(
                                    "flex-1 font-medium",
                                    !canCreate
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                )}
                                disabled={!canCreate}
                                onClick={handleCreateAdmin}
                            >
                                Create admin
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete admin?</DialogTitle>
                        </DialogHeader>
                        <p className="text-gray-600 py-4">
                            This action cannot be undone.
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedAdmin(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AdminContentCard>

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
