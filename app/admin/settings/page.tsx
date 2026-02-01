'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, Key, Trash, UserCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import PasswordInput from "@/components/PasswordInput";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";
import { AdminLayout, AdminContentCard } from "@/components/admin";

// Loading fallback component
const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-full"></div>
);

interface AdminUser {
    id: number;
    email: string;
    lastActive: string;
    created: string;
}

interface User {
    UserEncodeID: string;
    ID: number;
    Email: string;
    LastLogin: string;
    CreatedAt: string;
}

type SortField = 'last_login' | 'created_at';
type SortOrder = 'asc' | 'desc' | '';

// ============================================
// ADMIN SELF CHANGE PASSWORD COMPONENT
// For roleId === 2 (Admin)
// ============================================
const AdminSelfChangePassword: React.FC = () => {
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
// SUPERADMIN SETTINGS COMPONENT
// For roleId === 0 (Superadmin)
// Full admin management + self change password
// ============================================
const SuperAdminSettings: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const token = useAuthStore((state) => state.token);

    const { toast } = useToast();

    const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const [isDialogCreateOpen, setIsDialogCreateOpen] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");

    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
    const [isChangePasswordMyselfDialogOpen, setIsChangePasswordMyselfDialogOpen] = useState(false);
    const [passwordForAdmin, setPasswordForAdmin] = useState("");
    const [oldPasswordForAdmin, setOldPasswordForAdmin] = useState("");
    const [confirmPasswordForAdmin, setConfirmPasswordForAdmin] = useState("");
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [selectedSuperAdmin, setSelectedSuperAdmin] = useState<AdminUser | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showOPassword, setShowOPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);
    const [isMounted, setIsMounted] = useState(true);

    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('');

    // API: GET /user/admin (existing endpoint)
    const fetchUsers = async () => {
        try {
            if (!token) return;
            const sortFieldsString = sortField ? `${sortField} ${sortOrder}` : '';

            const response = await apiClient.get("/user/admin", {
                params: {
                    sort_fields: sortFieldsString,
                }
            });

            if (isMounted) {
                const data = response.data.users.map((user: User) => ({
                    id: user.ID,
                    email: user.Email,
                    lastActive: new Date(user.LastLogin).toLocaleString(),
                    created: new Date(user.CreatedAt).toLocaleString(),
                }));
                setUsers(data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        fetchUsers();

        const intervalId = setInterval(() => {
            if (isMounted) {
                fetchUsers();
            }
        }, 10000);

        return () => {
            setIsMounted(false);
            clearInterval(intervalId);
        };
    }, [token, sortField, sortOrder]);

    const handleDeleteClick = (user: AdminUser) => {
        setSelectedUser(user);
        setIsDialogDeleteOpen(true);
    };

    const handleChangePasswordClick = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setIsChangePasswordDialogOpen(true);
    };

    const handleChangeMyselfPasswordClick = (admin: AdminUser) => {
        setSelectedSuperAdmin(admin);
        setIsChangePasswordMyselfDialogOpen(true);
    };

    // API: PUT /user/change_password/admin (existing endpoint)
    const handleChangeMyPasswordSubmit = async () => {
        if (!selectedSuperAdmin) return;

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
            await apiClient.put("/user/change_password/admin", {
                new_password: passwordForAdmin,
                old_password: oldPasswordForAdmin,
                user_id: selectedSuperAdmin.id
            });

            toast({
                description: "Your password changed successfully.",
                variant: "default",
            });

            setIsChangePasswordMyselfDialogOpen(false);
            setPasswordForAdmin("");
            setOldPasswordForAdmin("");
            setConfirmPasswordForAdmin("");
            setSelectedSuperAdmin(null);
            fetchUsers();
        } catch (error) {
            setPasswordForAdmin("");
            setOldPasswordForAdmin("");
            setConfirmPasswordForAdmin("");

            let errorMessage = "Failed to change your password. Please try again."
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                errorMessage = error.response.data.error
            }
            toast({
                description: errorMessage,
                variant: "destructive",
            })
        }
    };

    // API: PUT /user/change_password/admin (existing endpoint)
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
            await apiClient.put("/user/change_password/admin", {
                new_password: passwordForAdmin,
                old_password: oldPasswordForAdmin,
                user_id: selectedAdmin.id
            });

            toast({
                description: "Password changed successfully.",
                variant: "default",
            });

            setIsChangePasswordDialogOpen(false);
            setIsChangePasswordMyselfDialogOpen(false);
            setPasswordForAdmin("");
            setOldPasswordForAdmin("");
            setConfirmPasswordForAdmin("");
            setSelectedAdmin(null);
            fetchUsers();
        } catch (error) {
            setPasswordForAdmin("");
            setOldPasswordForAdmin("");
            setConfirmPasswordForAdmin("");
            setSelectedAdmin(null);

            let errorMessage = "Failed to change password. Please try again."
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                errorMessage = error.response.data.error
            }
            toast({
                description: errorMessage,
                variant: "destructive",
            })
        }
    };

    // API: DELETE /user/admin/:id (existing endpoint)
    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        try {
            await apiClient.delete(`/user/admin/${selectedUser.id}`);

            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser.id));
            setIsDialogDeleteOpen(false);
            setSelectedUser(null);

            toast({
                description: "Admin deleted successfully!",
                variant: "default",
            });
        } catch (error) {
            let errorMessage = "Failed to delete admin. Please try again."
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                errorMessage = error.response.data.error
            }
            toast({
                description: errorMessage,
                variant: "destructive",
            })
        }
    };

    // API: POST /user/admin (existing endpoint)
    const handleCreateAdmin = async () => {
        if (!newAdminEmail || !newAdminPassword) {
            toast({
                title: "Error",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        if (newAdminPassword.length < 6) {
            toast({
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        try {
            await apiClient.post("/user/admin", {
                username: newAdminEmail,
                password: newAdminPassword,
            });

            toast({
                description: newAdminEmail + " admin has been successfully created!",
                variant: "default",
            });

            setIsDialogCreateOpen(false);
            setNewAdminEmail("");
            setNewAdminPassword("");
            fetchUsers();
        } catch (error) {
            let errorMessage = "Failed to create admin. Please try again."
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                errorMessage = error.response.data.error
            }
            toast({
                description: errorMessage,
                variant: "destructive",
            })
        }
    };

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

    const renderSortIcon = (field: SortField) => {
        if (sortField === field && sortOrder === 'asc') {
            return <ArrowUp className="ml-1 h-4 w-4" />;
        } else if (sortField === field && sortOrder === 'desc') {
            return <ArrowDown className="ml-1 h-4 w-4" />;
        }
        return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    };

    return (
        <>
            <div className="flex flex-col gap-5">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage admin accounts and permissions</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleChangeMyselfPasswordClick({ id: 0, email: "Myself", lastActive: "", created: "" })}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                            <Key className="h-4 w-4" />
                            Change My Password
                        </button>
                        <button
                            onClick={() => setIsDialogCreateOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Admin
                        </button>
                    </div>
                </div>

                {/* Admin Table Card */}
                <AdminContentCard title="Admin Users">
                    <div className="overflow-x-auto -mx-4 md:-mx-6">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Admin
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
                                    <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 md:px-6 py-12 text-center text-gray-500">
                                            No admin users found
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
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-medium text-sm">
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
                                            <td className="px-4 md:px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleChangePasswordClick(user)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                                                        title="Change Password"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Delete Admin"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminContentCard>
            </div>

            {/* Change Password Dialog for Other Admins */}
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

            {/* Change My Password Dialog */}
            <Dialog open={isChangePasswordMyselfDialogOpen} onOpenChange={setIsChangePasswordMyselfDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change My Password</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 mb-4">
                        Update your account password
                    </p>
                    <div className="space-y-4">
                        <PasswordInput
                            id="old-password"
                            placeholder="Current Password"
                            value={oldPasswordForAdmin}
                            onChange={(e) => {
                                const value = e.target.value;
                                const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                setOldPasswordForAdmin(sanitizedValue);
                            }}
                            showPassword={showOPassword}
                            setShowPassword={setShowOPassword}
                        />
                        <PasswordInput
                            id="new-password"
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
                            id="confirm-password"
                            placeholder="Confirm New Password"
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
                                setIsChangePasswordMyselfDialogOpen(false);
                                setPasswordForAdmin("");
                                setOldPasswordForAdmin("");
                                setConfirmPasswordForAdmin("");
                                setSelectedSuperAdmin(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={cn(
                                "flex-1 font-medium",
                                !passwordForAdmin || !oldPasswordForAdmin || !confirmPasswordForAdmin
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            )}
                            disabled={!passwordForAdmin || !oldPasswordForAdmin || !confirmPasswordForAdmin}
                            onClick={handleChangeMyPasswordSubmit}
                        >
                            Update Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDialogDeleteOpen} onOpenChange={setIsDialogDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Admin</DialogTitle>
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
                            Delete Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Admin Dialog */}
            <Dialog open={isDialogCreateOpen} onOpenChange={setIsDialogCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Admin</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 mb-4">
                        Add a new administrator account
                    </p>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Username</label>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    className="pl-10 h-11 rounded-xl border-gray-200"
                                    placeholder="Enter username"
                                    value={newAdminEmail}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        value = value.replace(/[^a-zA-Z0-9]/g, '');
                                        const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                        setNewAdminEmail(sanitizedValue);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <PasswordInput
                                id="new-admin-password"
                                placeholder="Enter password"
                                value={newAdminPassword}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                    setNewAdminPassword(sanitizedValue);
                                }}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                setIsDialogCreateOpen(false);
                                setNewAdminEmail("");
                                setNewAdminPassword("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={cn(
                                "flex-1 font-medium",
                                !newAdminEmail || !newAdminPassword
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            )}
                            disabled={!newAdminEmail || !newAdminPassword}
                            onClick={handleCreateAdmin}
                        >
                            Create Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

// ============================================
// MAIN SETTINGS PAGE COMPONENT
// Role-based rendering:
// - roleId === 0: Superadmin -> SuperAdminSettings
// - roleId === 2: Admin -> AdminSelfChangePassword
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
            {/*
                ROLE CHECK:
                - roleId === 0: Superadmin -> Full admin management
                - roleId === 2: Admin -> Self change password only
            */}
            {roleId === 0 ? (
                <SuperAdminSettings />
            ) : (
                <AdminSelfChangePassword />
            )}
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
