'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import PaginationComponent from "@/components/PaginationComponent";
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminLayout, UserRowActionMenu } from "@/components/admin";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { XCircleIcon } from '@heroicons/react/20/solid';
import { LockClosedIcon } from "@heroicons/react-v1/outline"
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";
import { useRequirePermission } from "@/hooks/use-require-permission";

interface EmailUser {
    user_encode_id: string;
    email_encode_id: string;
    id: number;
    email: string;
    lastActive: string;
    lastActiveRaw: string;
    created: string;
    createdByName: string;
}

interface User {
    user_encode_id: string;
    email_encode_id: string;
    ID: number;
    Email: string;
    LastLogin: string | null;
    CreatedAt: string;
    CreatedByName: string;
}

interface AdminUser {
    user_encode_id: string;
    email_encode_id: string;
    id: number;
    email: string;
    lastActive: string;
    created: string;
}

type SortField = 'last_login' | 'created_at';
type SortOrder = 'asc' | 'desc' | '';

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// Last Active Badge Component
const LastActiveBadge: React.FC<{ lastActiveRaw: string }> = ({ lastActiveRaw }) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActiveRaw);

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

    // Determine badge style and text
    let badgeClass = "h-5 px-1.5 py-0.5 rounded-3xl flex justify-center items-center gap-1";
    let textClass = "text-center justify-center text-xs font-medium font-['Roboto'] leading-5";
    let displayText = "";

    if (diffMins < 5) {
        // Online
        badgeClass += " bg-green-50";
        textClass += " text-green-500";
        displayText = "Online";
    } else if (diffMins < 60) {
        // Recent (sky/blue)
        badgeClass += " bg-blue-100";
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

const EmailManagementPageContent: React.FC = () => {
    const { allowed } = useRequirePermission("user_list");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<EmailUser[]>([]);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const pageSize = 10;
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const roleId = useAuthStore((state) => state.roleId);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [isLoading, setIsLoading] = useState(true);

    const { toast } = useToast();

    // Set page title
    useEffect(() => {
        document.title = "User List - Admin Mailria";
    }, []);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

    const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<EmailUser | null>(null);

    const [passwordForAdmin, setPasswordForAdmin] = useState("");
    const [confirmPasswordForAdmin, setConfirmPasswordForAdmin] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);

    useEffect(() => {
        // Clear password inputs on page load
        setSearchTerm("")
        setPasswordForAdmin("");
        setConfirmPasswordForAdmin("");
    }, [isChangePasswordDialogOpen]);

    const handleDeleteClick = (user: EmailUser) => {
        setSelectedUser(user);
        setIsDialogDeleteOpen(true);
    };

    // Function to handle "Change Password" button click
    const handleChangePasswordClick = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setIsChangePasswordDialogOpen(true);
    };

    // Function to handle password change submission
    const handleChangePasswordSubmit = async () => {
        if (!selectedAdmin) return;

        if (passwordForAdmin !== confirmPasswordForAdmin) {
            toast({
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        if (passwordForAdmin.length < 6) {
            toast({
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            await apiClient.put("/user/change_password", {
                new_password: passwordForAdmin,
                old_password: "",
                user_id: selectedAdmin.id,
            });

            toast({
                description: "Password changed successfully.",
                variant: "default",
            });

            // Reset state and close modal
            setIsChangePasswordDialogOpen(false);
            setPasswordForAdmin("");
            setConfirmPasswordForAdmin("");
            setSelectedAdmin(null);
            setSearchTerm(""); // Reset search term to refresh the list
        } catch (error) {
            setPasswordForAdmin("");
            setConfirmPasswordForAdmin("");
            setSelectedAdmin(null);
            setSearchTerm(""); // Reset search term to refresh the list

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

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        try {
            await apiClient.delete(`/user/${selectedUser.id}`);

            // Remove the deleted user from the state
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser.id));
            setIsDialogDeleteOpen(false);
            setSelectedUser(null);

            // Show success toast
            toast({
                title: "Success",
                description: "User deleted successfully!",
                variant: "default",
            });

            // Fetch users again to refresh the list
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            let errorMessage = "Failed to delete user. Please try again.";
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                errorMessage = error.response.data.message;
            }
            toast({
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleSearch = (value: string) => {
        if (value !== searchTerm) {
            setSearchTerm(value);
            setCurrentPage(1); // Reset to first page when searching
        }
    };

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const sortFieldsString = sortField ? `${sortField} ${sortOrder}` : '';

            const response = await apiClient.get("/user/", {
                params: {
                    page: currentPage,
                    page_size: pageSize,
                    email: searchTerm,
                    sort_fields: sortFieldsString,
                },
            });

            if (!response.data || !response.data.users) {
                setUsers([]);
                setTotalPages(1);
                setTotalCount(0);
                setActiveCount(0);
                return;
            }

            const data = response.data.users.map((user: User) => {
                // Use LastLogin if available and not zero time, otherwise fallback to CreatedAt
                const lastLoginDate = user.LastLogin && user.LastLogin !== "0001-01-01T00:00:00Z"
                    ? user.LastLogin
                    : user.CreatedAt;

                return {
                    id: user.ID,
                    email: user.Email,
                    lastActive: formatDate(lastLoginDate),
                    lastActiveRaw: lastLoginDate,
                    created: formatDate(user.CreatedAt),
                    createdByName: user.CreatedByName,
                    user_encode_id: user.user_encode_id,
                };
            });
            setUsers(data);
            setTotalPages(response.data.total_pages || 1);
            setTotalCount(response.data.total_count || 0);
            setActiveCount(response.data.active_count || 0);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if (!_hasHydrated || roleId === 1) return;

        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [_hasHydrated, token, currentPage, pageSize, searchTerm, sortField, sortOrder, roleId]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else if (sortOrder === 'desc') {
                setSortField(null);
                setSortOrder('');
            } else {
                setSortOrder('asc');
            }
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Render sort icon based on field and current sort state
    // Keep icon style consistent with design reference.
    const renderSortIcon = (field: SortField) => {
        const isActiveSortField = sortField === field;
        return (
            <ChevronUpDownIcon
                className={`w-2 h-[14px] shrink-0 ${isActiveSortField ? "text-neutral-700" : "text-neutral-500"}`}
            />
        );
    };

    if (!allowed) return null;

    return (
        <AdminLayout>
            <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
                {/* Header */}
                <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
                        User list
                    </div>
                    <div className="w-64 h-10 inline-flex flex-col justify-between items-start">
                        <div className="search-input-wrapper self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-between items-center">
                            <div className="flex justify-start items-center gap-2 flex-1">
                                <input
                                    id="by_username"
                                    placeholder="Search user..."
                                    className="search-input flex-1 bg-transparent border-none outline-none text-neutral-900 text-sm font-normal font-['Roboto'] leading-5 placeholder:text-neutral-200"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const sanitizedValue = DOMPurify.sanitize(value);
                                        handleSearch(sanitizedValue);
                                    }}
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 text-neutral-800" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="self-stretch p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-start overflow-hidden relative">
                    <Toaster />

                    {/* Loading Overlay - only covers table card */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-neutral-600 text-sm font-medium">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 overflow-hidden">
                            <div className="self-stretch overflow-x-auto">
                                <div className="min-w-[980px]">
                            {/* Table Header */}
                            <div className="flex w-full bg-white border-b border-neutral-200">
                                <div className="w-80 h-11 px-4 py-3 flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        className="h-auto p-0 inline-flex items-center gap-1 cursor-default hover:bg-transparent"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Name</div>
                                        <ChevronUpDownIcon className="w-2 h-[14px] shrink-0 text-neutral-500" />
                                    </Button>
                                </div>
                                <div className="flex-1 h-11 px-4 py-3 flex items-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('last_login')}
                                        className="h-auto p-0 inline-flex items-center gap-1 hover:text-neutral-900 transition-colors"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Last active</div>
                                        {renderSortIcon('last_login')}
                                    </Button>
                                </div>
                                <div className="flex-1 h-11 px-4 py-3 flex items-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('created_at')}
                                        className="h-auto p-0 inline-flex items-center gap-1 hover:text-neutral-900 transition-colors"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Created</div>
                                        {renderSortIcon('created_at')}
                                    </Button>
                                </div>
                                <div className="flex-1 h-11 px-4 py-3 flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        className="h-auto p-0 inline-flex items-center gap-1 cursor-default hover:bg-transparent"
                                    >
                                        <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Created by</div>
                                        <ChevronUpDownIcon className="w-2 h-[14px] shrink-0 text-neutral-500" />
                                    </Button>
                                </div>
                                <div className="w-[72px] h-11 px-4 py-3 flex justify-center items-center">
                                    <div className="text-neutral-700 text-sm font-medium font-['Roboto'] leading-5">Action</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            {isLoading ? (
                                <AdminLoadingPlaceholder />
                            ) : users.length === 0 ? (
                                <div className="self-stretch h-96 flex flex-col justify-center items-center gap-1 bg-white">
                                    <div className="inline-flex justify-center items-center gap-1">
                                        <div className="w-5 h-5 relative overflow-hidden">
                                            {/* <div className="w-4 h-4 left-[1.88px] top-[1.88px] absolute bg-red-500"></div> */}
                                            <XCircleIcon className="w-5 h-5 absolute text-red-500" />
                                        </div>
                                        <div className="justify-center text-neutral-800 text-base font-medium font-['Roboto'] leading-6">
                                            {searchTerm.trim().length > 0 ? "Email not found" : "No users found"}
                                        </div>
                                    </div>
                                    <div className="justify-center text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                                        {searchTerm.trim().length > 0
                                            ? "Please check your keyword and try again."
                                            : "No users are available yet."}
                                    </div>
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user.email}
                                        className="group flex w-full border-b border-neutral-200 cursor-pointer bg-white hover:bg-neutral-100"
                                        onClick={() => router.push(`/admin/user/${user.user_encode_id}`)}
                                    >
                                        {/* Name */}
                                        <div className="w-80 h-11 px-4 py-3 flex items-center">
                                            <div className="text-neutral-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {user.email}
                                            </div>
                                        </div>
                                        {/* Last Active */}
                                        <div className="flex-1 h-11 px-4 py-3 flex items-center">
                                            <LastActiveBadge lastActiveRaw={user.lastActiveRaw} />
                                        </div>
                                        {/* Created */}
                                        <div className="flex-1 h-11 px-4 py-3 flex items-center">
                                            <div className="text-neutral-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {user.created}
                                            </div>
                                        </div>
                                        {/* Created By */}
                                        <div className="flex-1 h-11 px-4 py-3 flex items-center">
                                            <div className="text-neutral-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {user.createdByName || "System"}
                                            </div>
                                        </div>
                                        {/* Action */}
                                        <div
                                            className="w-[72px] h-11 px-4 py-3 flex justify-center items-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <UserRowActionMenu
                                                onView={() => router.push(`/admin/user/${user.user_encode_id}`)}
                                                onChangePassword={() => handleChangePasswordClick(user)}
                                                onDelete={() => handleDeleteClick(user)}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {users.length > 0 && !searchTerm.trim().length && (
                            <div className="self-stretch">
                                <PaginationComponent
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    totalCount={totalCount}
                                    activeCount={activeCount}
                                    pageSize={pageSize}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password Dialog */}
                <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                    <DialogContent className="p-4 w-auto max-w-none border-0 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-center gap-4 overflow-hidden [&>button]:hidden">
                        <DialogTitle className="sr-only">Change password</DialogTitle>
                        {/* Header */}
                        <div className="w-[518px] inline-flex justify-between items-center">
                            <div className="justify-center text-neutral-800 text-base font-medium font-['Roboto'] leading-6">Change Password</div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setIsChangePasswordDialogOpen(false);
                                    setPasswordForAdmin("");
                                    setConfirmPasswordForAdmin("");
                                    setSelectedAdmin(null);
                                }}
                                className="w-10 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-neutral-50 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-neutral-800" />
                            </Button>
                        </div>

                        {/* Form */}
                        <div className="w-[518px] flex flex-col justify-start items-start gap-4">
                            <div className="self-stretch flex flex-col justify-start items-center gap-3">
                                {/* New Password Input */}
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                    <div className="self-stretch relative flex flex-col justify-start items-start">
                                        <div className="self-stretch h-3.5"></div>
                                        <div className={cn(
                                            "self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-3",
                                            confirmPasswordForAdmin && passwordForAdmin && confirmPasswordForAdmin !== passwordForAdmin
                                                ? "outline-red-500"
                                                : "outline-neutral-200"
                                        )}>
                                            <div className="flex-1 flex justify-start items-center gap-2">
                                                <LockClosedIcon className={cn(
                                                    "w-5 h-5",
                                                    confirmPasswordForAdmin && passwordForAdmin && confirmPasswordForAdmin !== passwordForAdmin
                                                        ? "text-red-400"
                                                        : "text-neutral-400"
                                                )} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwordForAdmin}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                                        setPasswordForAdmin(sanitizedValue);
                                                    }}
                                                    placeholder="***********"
                                                    className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="h-auto flex justify-center items-center"
                                            >
                                                {showPassword ? (
                                                    <Eye className="w-5 h-5 text-neutral-800" />
                                                ) : (
                                                    <EyeOff className="w-5 h-5 text-neutral-800" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                            <div className={cn(
                                                "justify-center text-[10px] font-normal font-['Roboto'] leading-4",
                                                confirmPasswordForAdmin && passwordForAdmin && confirmPasswordForAdmin !== passwordForAdmin
                                                    ? "text-red-500"
                                                    : "text-neutral-800"
                                            )}>New password</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                    <div className="self-stretch relative flex flex-col justify-start items-start">
                                        <div className="self-stretch h-3.5"></div>
                                        <div className={cn(
                                            "self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-3",
                                            confirmPasswordForAdmin && passwordForAdmin && confirmPasswordForAdmin !== passwordForAdmin
                                                ? "outline-red-500"
                                                : "outline-neutral-200"
                                        )}>
                                            <div className="flex-1 flex justify-start items-center gap-2">
                                                <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                                                <input
                                                    type={showCPassword ? "text" : "password"}
                                                    value={confirmPasswordForAdmin}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                                        setConfirmPasswordForAdmin(sanitizedValue);
                                                    }}
                                                    placeholder="***********"
                                                    className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={() => setShowCPassword(!showCPassword)}
                                                className="h-auto flex justify-center items-center"
                                            >
                                                {showCPassword ? (
                                                    <Eye className="w-5 h-5 text-neutral-800" />
                                                ) : (
                                                    <EyeOff className="w-5 h-5 text-neutral-800" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className={cn(
                                            "px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5",
                                        )}>
                                            <div className={cn(
                                                "justify-center text-[10px] font-normal font-['Roboto'] leading-4",
                                                confirmPasswordForAdmin && passwordForAdmin && confirmPasswordForAdmin !== passwordForAdmin
                                                    ? "text-red-500"
                                                    : "text-neutral-800"
                                            )}>Confirm password</div>
                                        </div>
                                    </div>
                                    {/* Error Message */}
                                    {confirmPasswordForAdmin && passwordForAdmin && confirmPasswordForAdmin !== passwordForAdmin && (
                                        <div className="text-red-500 text-xs font-normal font-['Roboto'] leading-4 pl-1">
                                            Your confirmation password doesn&apos;t match.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleChangePasswordSubmit}
                                disabled={!passwordForAdmin || !confirmPasswordForAdmin || passwordForAdmin !== confirmPasswordForAdmin}
                                className="self-stretch h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
                            >
                                <div className="text-center justify-center text-white text-base font-medium font-['Roboto'] leading-4">Change password</div>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDialogDeleteOpen} onOpenChange={setIsDialogDeleteOpen}>
                    <DialogContent className="w-96 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-center overflow-hidden gap-0 [&>button]:hidden">
                        <DialogTitle className="sr-only">Delete user confirmation</DialogTitle>
                        <div className="self-stretch relative flex flex-col justify-start items-center gap-8">
                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDialogDeleteOpen(false)}
                                className="h-auto w-5 h-5 absolute right-0 top-0 overflow-hidden flex items-center justify-center hover:opacity-70 transition-opacity"
                            >
                                <XMarkIcon className="w-4 h-4 text-neutral-800" />
                            </Button>

                            <div className="self-stretch flex flex-col justify-start items-center gap-5">
                                {/* Icon */}
                                <div className="w-12 h-12 p-2 bg-red-50 rounded-3xl inline-flex justify-center items-center gap-2.5">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>

                                {/* Title & Description */}
                                <div className="self-stretch flex flex-col justify-start items-center gap-2">
                                    <div className="self-stretch text-center justify-center text-neutral-900 text-lg font-medium font-['Roboto'] leading-7">
                                        Delete user?
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-center text-center">
                                        <span className="text-neutral-500 text-sm font-normal font-['Roboto'] leading-5">Are you sure you want to delete</span>
                                        <span className="text-neutral-800 text-sm font-semibold font-['Roboto'] leading-5">{selectedUser?.email}?</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="self-stretch inline-flex justify-start items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogDeleteOpen(false)}
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
        </AdminLayout>
    );
};

const EmailManagementPage: React.FC = () => {
    return (
        <Suspense fallback={<div></div>}>
            <EmailManagementPageContent />
        </Suspense>
    );
};

export default EmailManagementPage;


