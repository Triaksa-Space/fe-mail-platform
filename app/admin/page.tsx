'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import PaginationComponent from "@/components/PaginationComponent";
import { ArrowUp, ArrowDown, Search, AlertTriangle, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import { AdminLayout, UserRowActionMenu } from "@/components/admin";
import { ChevronUpDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

// Last Active Badge Component
const LastActiveBadge: React.FC<{ lastActiveRaw: string }> = ({ lastActiveRaw }) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActiveRaw);

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
        badgeClass += " bg-sky-100";
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

const EmailManagementPageContent: React.FC = () => {
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
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();
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
                errorMessage = error.response.data.error;
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
                    lastActive: new Date(lastLoginDate).toLocaleString(),
                    lastActiveRaw: lastLoginDate,
                    created: new Date(user.CreatedAt).toLocaleString(),
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
    const renderSortIcon = (field: SortField) => {
        if (sortField === field && sortOrder === 'asc') {
            return <ArrowUp className="ml-1 h-4 w-4" />;
        } else if (sortField === field && sortOrder === 'desc') {
            return <ArrowDown className="ml-1 h-4 w-4" />;
        }
        return <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />;
    };

    return (
        <AdminLayout>
            <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
                {/* Header */}
                <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
                        User list
                    </div>
                    <div className="w-64 h-10 inline-flex flex-col justify-between items-start">
                        <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center">
                            <div className="flex justify-start items-center gap-2 flex-1">
                                <input
                                    id="by_username"
                                    placeholder="Search user..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm font-normal font-['Roboto'] leading-5 placeholder:text-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const sanitizedValue = DOMPurify.sanitize(value);
                                        handleSearch(sanitizedValue);
                                    }}
                                />
                                <MagnifyingGlassIcon className="w-4 h-4 text-gray-800" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="self-stretch p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-start gap-4 overflow-hidden relative">
                    <Toaster />

                    {/* Loading Overlay - only covers table card */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-gray-600 text-sm font-medium">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="flex w-full bg-white border-b border-gray-200">
                                <div className="w-80 px-4 py-3 flex items-center gap-1">
                                    <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Name</div>
                                    <ChevronUpDownIcon className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 px-4 py-3">
                                    <button
                                        onClick={() => toggleSort('last_login')}
                                        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                                    >
                                        <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Last active</div>
                                        {renderSortIcon('last_login')}
                                    </button>
                                </div>
                                <div className="flex-1 px-4 py-3">
                                    <button
                                        onClick={() => toggleSort('created_at')}
                                        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                                    >
                                        <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Created</div>
                                        {renderSortIcon('created_at')}
                                    </button>
                                </div>
                                <div className="flex-1 px-4 py-3 flex items-center gap-1">
                                    <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Created by</div>
                                    <ChevronUpDownIcon className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="w-20 px-4 py-3 flex justify-center items-center">
                                    <div className="text-gray-700 text-sm font-medium font-['Roboto'] leading-5">Action</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            {users.length === 0 ? (
                                <div className="flex w-full bg-white border-b border-gray-200 px-4 py-3">
                                    <div className="text-gray-500 text-sm font-normal font-['Roboto'] leading-5">
                                        {isLoading ? "Loading..." : "No users found"}
                                    </div>
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user.email}
                                        className="flex w-full bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/user/${user.user_encode_id}`)}
                                    >
                                        {/* Name */}
                                        <div className="w-80 px-4 py-3 flex items-center">
                                            <div className="text-gray-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {user.email}
                                            </div>
                                        </div>
                                        {/* Last Active */}
                                        <div className="flex-1 px-4 py-3 flex items-center">
                                            <LastActiveBadge lastActiveRaw={user.lastActiveRaw} />
                                        </div>
                                        {/* Created */}
                                        <div className="flex-1 px-4 py-3 flex items-center">
                                            <div className="text-gray-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {user.created}
                                            </div>
                                        </div>
                                        {/* Created By */}
                                        <div className="flex-1 px-4 py-3 flex items-center">
                                            <div className="text-gray-900 text-sm font-medium font-['Roboto'] leading-5">
                                                {user.createdByName || "System"}
                                            </div>
                                        </div>
                                        {/* Action */}
                                        <div
                                            className="w-20 px-4 py-3 flex justify-center items-center"
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

                        {/* Pagination */}
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
                    </div>
                </div>

                {/* Change Password Dialog */}
                <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                    <DialogContent className="p-4 w-auto max-w-none border-0 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-center gap-4 overflow-hidden [&>button]:hidden">
                        {/* Header */}
                        <div className="w-[518px] inline-flex justify-between items-center">
                            <div className="justify-center text-gray-800 text-base font-medium font-['Roboto'] leading-6">Change Password</div>
                            <button
                                onClick={() => {
                                    setIsChangePasswordDialogOpen(false);
                                    setPasswordForAdmin("");
                                    setConfirmPasswordForAdmin("");
                                    setSelectedAdmin(null);
                                }}
                                className="w-10 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-800" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="w-[518px] flex flex-col justify-start items-start gap-4">
                            <div className="self-stretch flex flex-col justify-start items-center gap-3">
                                {/* New Password Input */}
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                    <div className="self-stretch relative flex flex-col justify-start items-start">
                                        <div className="self-stretch h-3.5"></div>
                                        <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                                            <div className="flex-1 flex justify-start items-center gap-2">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={passwordForAdmin}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                                        setPasswordForAdmin(sanitizedValue);
                                                    }}
                                                    placeholder="***********"
                                                    className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="flex justify-center items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5 text-gray-800" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-800" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                            <div className="justify-center text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">New password</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                    <div className="self-stretch relative flex flex-col justify-start items-start">
                                        <div className="self-stretch h-3.5"></div>
                                        <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                                            <div className="flex-1 flex justify-start items-center gap-2">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showCPassword ? "text" : "password"}
                                                    value={confirmPasswordForAdmin}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                                        setConfirmPasswordForAdmin(sanitizedValue);
                                                    }}
                                                    placeholder="***********"
                                                    className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowCPassword(!showCPassword)}
                                                className="flex justify-center items-center"
                                            >
                                                {showCPassword ? (
                                                    <EyeOff className="w-5 h-5 text-gray-800" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-800" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                            <div className="justify-center text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Confirm password</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleChangePasswordSubmit}
                                disabled={!passwordForAdmin || !confirmPasswordForAdmin}
                                className={cn(
                                    "self-stretch h-10 px-4 py-2.5 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] inline-flex justify-center items-center gap-1.5 transition-colors",
                                    !passwordForAdmin || !confirmPasswordForAdmin
                                        ? "bg-sky-400 outline-sky-400 cursor-not-allowed"
                                        : "bg-sky-600 outline-sky-600 hover:bg-sky-700"
                                )}
                            >
                                <div className="text-center justify-center text-white text-base font-medium font-['Roboto'] leading-4">Change password</div>
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDialogDeleteOpen} onOpenChange={setIsDialogDeleteOpen}>
                    <DialogContent className="w-96 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-center overflow-hidden gap-0 [&>button]:hidden">
                        <div className="self-stretch relative flex flex-col justify-start items-center gap-8">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsDialogDeleteOpen(false)}
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
                                        Delete user?
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-center text-center">
                                        <span className="text-gray-500 text-sm font-normal font-['Roboto'] leading-5">Are you sure you want to delete</span>
                                        <span className="text-gray-800 text-sm font-semibold font-['Roboto'] leading-5">{selectedUser?.email}?</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="self-stretch inline-flex justify-start items-center gap-3">
                                <button
                                    onClick={() => setIsDialogDeleteOpen(false)}
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