'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import PaginationComponent from "@/components/PaginationComponent";
import { UserPlus } from 'lucide-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";
import {
    AdminLayout,
    AdminRowActionMenu,
    PermissionChips
} from "@/components/admin";
import {
    AdminUser,
    AdminListApiResponse,
    formatDate,
} from "@/lib/admin-types";
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";

type SortField = 'username' | 'last_active_at' | 'created_at';
type SortOrder = 'asc' | 'desc';

// Last Active Badge Component - matching user list style
const LastActiveBadge: React.FC<{ lastActiveAt: string | null }> = ({ lastActiveAt }) => {
    if (!lastActiveAt) {
        return (
            <div className="h-5 px-1.5 py-0.5 bg-neutral-100 rounded-3xl flex justify-center items-center gap-1">
                <div className="text-center justify-center text-neutral-700 text-xs font-medium font-['Roboto'] leading-5">-</div>
            </div>
        );
    }

    const now = new Date();
    const lastActiveDate = new Date(lastActiveAt);

    // Check for invalid date
    if (isNaN(lastActiveDate.getTime())) {
        return (
            <div className="h-5 px-1.5 py-0.5 bg-neutral-100 rounded-3xl flex justify-center items-center gap-1">
                <div className="text-center justify-center text-neutral-700 text-xs font-medium font-['Roboto'] leading-5">-</div>
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
        // Online
        badgeClass += " bg-success-50";
        textClass += " text-success-500";
        displayText = "Online";
    } else if (diffMins < 60) {
        // Recent (sky/blue)
        badgeClass += " bg-primary-50";
        textClass += " text-neutral-700";
        displayText = `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        badgeClass += " bg-neutral-100";
        textClass += " text-neutral-700";
        displayText = `${diffHours} hours ago`;
    } else {
        badgeClass += " bg-neutral-100";
        textClass += " text-neutral-700";
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
    const searchParams = useSearchParams();
    const createdUsername = searchParams.get("created");
    const token = useAuthStore((state) => state.token);
    const roleId = useAuthStore((state) => state.roleId);
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Auth loading state
    const [authLoaded, setAuthLoaded] = useState(false);

    // Set page title
    useEffect(() => {
        document.title = "Roles & Permissions - Admin Mailria";
    }, []);

    // Delete confirmation modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

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

        // SuperAdmin or admin with roles_permissions can access this page
        if (roleId !== 0 && !hasPermission('roles_permissions')) {
            router.replace("/admin");
        }
    }, [authLoaded, roleId, hasPermission, router]);

    useEffect(() => {
        if (!createdUsername) return;

        toast({
            description: `${createdUsername} created successfully.`,
            variant: "default",
        });
        router.replace("/admin/roles");
    }, [createdUsername, router, toast]);

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
    }, [currentPage, pageSize, sortField, sortOrder, searchQuery, router]);

    useEffect(() => {
        if (!authLoaded || (roleId !== 0 && !hasPermission('roles_permissions'))) return;

        const timeoutId = setTimeout(() => {
            fetchAdmins();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [authLoaded, token, currentPage, pageSize, sortField, sortOrder, searchQuery, roleId, hasPermission, fetchAdmins]);

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
        const isActiveSortField = sortField === field;
        return (
            <ChevronUpDownIcon
                className={`w-2 h-[14px] shrink-0 ${isActiveSortField ? 'text-neutral-700' : 'text-neutral-500'}`}
            />
        );
    };

    const handleEditClick = (admin: AdminUser) => {
        router.push(`/admin/roles/${admin.id}/edit?from=list`);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Toaster />
            <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
                {/* Page Header */}
                <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
                        Roles & permissions
                    </div>
                </div>

                {/* Table Card */}
                <div className="self-stretch p-6 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-start gap-4 overflow-visible relative">

                    {/* Loading Overlay removed: loading is shown in card body only */}

                    {/* Header Row */}
                    <div className="self-stretch inline-flex justify-between items-center">
                        <div className="justify-center text-neutral-800 text-lg font-medium font-['Roboto'] leading-7">
                            Admin list
                        </div>
                        <div className="flex justify-end items-center gap-3">
                            <Button
                                onClick={() => router.push("/admin/roles/create")}
                                className="h-10 px-4 py-2.5 btn-primary-skin flex justify-center items-center gap-1.5 transition-colors"
                            >
                                <UserPlus className="h-5 w-5 text-white" />
                                <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">
                                    Create admin
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 overflow-visible">
                            <div className="self-stretch overflow-x-auto overflow-y-visible">
                                <div className="min-w-[980px]">
                            {/* Table Header */}
                            <div className="flex w-full bg-white border-b border-neutral-200">
                                <div className="w-56 h-11 px-4 py-3 flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('username')}
                                        className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors h-auto p-0"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Username</div>
                                        {renderSortIcon('username')}
                                    </Button>
                                </div>
                                <div className="w-32 h-11 px-4 py-3 flex items-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('last_active_at')}
                                        className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors h-auto p-0"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Last active</div>
                                        {renderSortIcon('last_active_at')}
                                    </Button>
                                </div>
                                <div className="flex-1 h-11 px-4 py-3 flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        className="h-auto p-0 inline-flex items-center gap-1 cursor-default hover:bg-transparent"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Role</div>
                                        <ChevronUpDownIcon className="w-2 h-[14px] shrink-0 text-neutral-500" />
                                    </Button>
                                </div>
                                <div className="w-32 h-11 px-4 py-3 flex items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('created_at')}
                                        className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors h-auto p-0"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Created</div>
                                        {renderSortIcon('created_at')}
                                    </Button>
                                </div>
                                <div className="w-[72px] h-11 px-4 py-3 flex justify-center items-center">
                                    <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Action</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            {isLoading ? (
                                <AdminLoadingPlaceholder heightClassName="h-32" />
                            ) : admins.length === 0 ? (
                                <div className="flex w-full bg-white border-b border-neutral-200 px-4 py-3">
                                    <div className="text-neutral-500 text-sm font-normal font-['Roboto'] leading-5">
                                        {searchQuery ? "No admins found matching your search" : "No admins found"}
                                    </div>
                                </div>
                            ) : (
                                admins.map((admin) => (
                                    <div
                                        key={admin.id}
                                        className="flex w-full bg-white border-b border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/roles/${admin.id}`)}
                                    >
                                        {/* Username */}
                                        <div className="w-56 min-h-11 px-4 py-3 flex items-center">
                                            <div className="text-neutral-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {admin.username}
                                            </div>
                                        </div>
                                        {/* Last Active */}
                                        <div className="w-32 min-h-11 px-4 py-3 flex items-center justify-center">
                                            <LastActiveBadge
                                                lastActiveAt={admin.last_active_at}
                                            />
                                        </div>
                                        {/* Role/Permissions */}
                                        <div className="flex-1 min-h-11 px-4 py-3 flex items-center">
                                            <PermissionChips
                                                permissions={admin.permissions}
                                                className="w-full"
                                            />
                                        </div>
                                        {/* Created Date */}
                                        <div className="w-32 min-h-11 px-4 py-3 flex items-center justify-center">
                                            <div className="text-neutral-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {formatDate(admin.created_at)}
                                            </div>
                                        </div>
                                        {/* Action */}
                                        <div
                                            className="w-[72px] min-h-11 px-4 py-3 flex justify-center items-center"
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
                            </div>
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

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="w-96 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-center overflow-hidden gap-0 [&>button]:hidden">
                        <DialogTitle className="sr-only">Delete admin confirmation</DialogTitle>
                        <div className="self-stretch relative flex flex-col justify-start items-center gap-8">
                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="w-5 h-5 absolute right-0 top-1.5 overflow-hidden flex items-center justify-center hover:opacity-70 transition-opacity h-auto p-0"
                            >
                                <XMarkIcon className="w-4 h-4 text-neutral-800" />
                            </Button>

                            <div className="self-stretch flex flex-col justify-start items-center gap-5">
                                {/* Icon */}
                                <div className="w-12 h-12 p-2 bg-red-50 rounded-3xl inline-flex justify-center items-center gap-2.5">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                                </div>

                                {/* Title & Description */}
                                <div className="self-stretch flex flex-col justify-start items-center gap-2">
                                    <div className="self-stretch text-center justify-center text-neutral-900 text-lg font-medium font-['Roboto'] leading-7">
                                        Delete admin?
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-center text-center">
                                        <span className="text-neutral-500 text-sm font-normal font-['Roboto'] leading-5">Are you sure you want to delete</span>
                                        <span className="text-neutral-800 text-sm font-semibold font-['Roboto'] leading-5">{selectedAdmin?.username}?</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="self-stretch inline-flex justify-start items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setSelectedAdmin(null);
                                    }}
                                    className="flex-1 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-neutral-50 transition-colors"
                                >
                                    <div className="text-center justify-center text-neutral-700 text-base font-medium font-['Roboto'] leading-4">Cancel</div>
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 h-10 px-4 py-2.5 bg-red-500 rounded-lg shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-red-600 flex justify-center items-center gap-1.5 overflow-hidden hover:bg-red-600 transition-colors"
                                >
                                    <div className="text-center justify-center text-white text-base font-medium font-['Roboto'] leading-4">Delete</div>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Removed full-page loading overlay */}
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


