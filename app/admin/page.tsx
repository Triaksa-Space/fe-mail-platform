'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/PaginationComponent";
import { ArrowUp, ArrowDown, ArrowUpDown, Search } from 'lucide-react';
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
import { AdminLayout, AdminContentCard, UserRowActionMenu } from "@/components/admin";

interface EmailUser {
    user_encode_id: string;
    email_encode_id: string;
    id: number;
    email: string;
    lastActive: string;
    created: string;
    createdByName: string;
}

interface User {
    user_encode_id: string;
    email_encode_id: string;
    ID: number;
    Email: string;
    LastLogin: string;
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
    const [isLoading, setIsLoading] = useState(false)

    // New state to manage auth loading
    const [authLoaded, setAuthLoaded] = useState(false);

    useEffect(() => {
        // Wait for the auth store to load and set the state
        setAuthLoaded(true);
    }, []);

    // Use effect for redirection logic
    useEffect(() => {
        if (!authLoaded) return;

        const storedToken = useAuthStore.getState().getStoredToken();
        if (!storedToken) {
            router.replace("/");
            return;
        }

        if (roleId === 1) {
            router.replace("/not-found");
        }
    }, [authLoaded, roleId, router]);

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
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/change_password`,
                {
                    new_password: passwordForAdmin,
                    old_password: "",
                    user_id: selectedAdmin.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${selectedUser.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

            const data = response.data.users.map((user: User) => ({
                id: user.ID,
                email: user.Email,
                lastActive: new Date(user.LastLogin).toLocaleString(),
                created: new Date(user.CreatedAt).toLocaleString(),
                createdByName: user.CreatedByName,
                user_encode_id: user.user_encode_id,
            }));
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
        if (!authLoaded || roleId === 1) return;

        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [authLoaded, token, currentPage, pageSize, searchTerm, sortField, sortOrder, roleId]);

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
        return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    };

    return (
        <AdminLayout>
            <AdminContentCard
                title="User List"
                headerRight={
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="by_username"
                            placeholder="Search by username..."
                            className="pl-9 w-full sm:w-64 bg-gray-50 border-gray-200 focus:bg-white"
                            value={searchTerm}
                            onChange={(e) => {
                                const value = e.target.value;
                                const sanitizedValue = DOMPurify.sanitize(value);
                                handleSearch(sanitizedValue);
                            }}
                        />
                    </div>
                }
            >
                <Toaster />

                {/* Modern Table */}
                <div className="overflow-x-auto -mx-4 md:-mx-6">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => toggleSort('last_login')}
                                        className="flex items-center hover:text-gray-900 transition-colors"
                                    >
                                        Last Active
                                        {renderSortIcon('last_login')}
                                    </button>
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Created By
                                </th>
                                <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 md:px-6 py-12 text-center text-gray-500">
                                        {isLoading ? "Loading users..." : "No users found"}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.email}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {user.lastActive}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {user.created}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                                {user.createdByName || "System"}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right">
                                            <UserRowActionMenu
                                                onView={() => router.push(`/admin/user/${user.user_encode_id}`)}
                                                onChangePassword={() => handleChangePasswordClick(user)}
                                                onDelete={() => handleDeleteClick(user)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <PaginationComponent
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        totalCount={totalCount}
                        activeCount={activeCount}
                        pageSize={pageSize}
                    />
                </div>

                {/* Change Password Dialog - Unchanged */}
                <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-500 mb-4">
                            Update password for <span className="font-medium text-gray-900">{selectedAdmin?.email}</span>
                        </p>
                        <div className="space-y-4">
                            <PasswordInput
                                id="password"
                                placeholder="New Password"
                                value={passwordForAdmin}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                    setPasswordForAdmin(sanitizedValue);
                                }}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                            <PasswordInput
                                id="confirm_password"
                                placeholder="Confirm Password"
                                value={confirmPasswordForAdmin}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                    setConfirmPasswordForAdmin(sanitizedValue);
                                }}
                                showPassword={showCPassword}
                                setShowPassword={setShowCPassword}
                            />
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsChangePasswordDialogOpen(false);
                                    setPasswordForAdmin("");
                                    setConfirmPasswordForAdmin("");
                                    setSelectedAdmin(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={cn(
                                    "flex-1 font-medium",
                                    !passwordForAdmin || !confirmPasswordForAdmin
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                )}
                                disabled={!passwordForAdmin || !confirmPasswordForAdmin}
                                onClick={handleChangePasswordSubmit}
                            >
                                Update Password
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog - Unchanged */}
                <Dialog open={isDialogDeleteOpen} onOpenChange={setIsDialogDeleteOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                        </DialogHeader>
                        <p className="text-gray-600">
                            Are you sure you want to delete <span className="font-medium text-gray-900">{selectedUser?.email}</span>? This action cannot be undone.
                        </p>
                        <DialogFooter className="mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsDialogDeleteOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDeleteConfirm}
                            >
                                Delete User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AdminContentCard>

            {isLoading && <LoadingProcessingPage />}
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