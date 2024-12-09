'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import PaginationComponent from "@/components/PaginationComponent"
import { ChevronUp, ChevronDown, Key, Trash, ZoomIn } from 'lucide-react'
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster";
import PasswordInput from '@/components/PasswordInput'

interface EmailUser {
    id: number
    email: string
    lastActive: string
    created: string
    createdByName: string
}

interface User {
    ID: number
    Email: string
    LastLogin: string
    CreatedAt: string
    CreatedByName: string
}

interface AdminUser {
    id: number
    email: string
    lastActive: string
    created: string
}

type SortField = 'last_login' | 'created_at'
type SortOrder = 'asc' | 'desc'

const EmailManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<EmailUser[]>([])
    const [sortFields, setSortFields] = useState<{ field: SortField, order: SortOrder }[]>([
        { field: 'last_login', order: 'desc' },
        { field: 'created_at', order: 'asc' },
    ]);
    // const [isLoading, setIsLoading] = useState(true)
    // const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [activeCount, setActiveCount] = useState(0)
    const pageSize = 10
    const [totalPages, setTotalPages] = useState(1)
    const router = useRouter();
    const token = useAuthStore((state) => state.token);

    // Move the token check to useEffect
    useEffect(() => {
        const storedToken = useAuthStore.getState().getStoredToken();
        if (!storedToken) {
            router.replace("/");
            return;
        }
    }, [router]);

    const { toast } = useToast();
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

    const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<EmailUser | null>(null);

    const [passwordForAdmin, setPasswordForAdmin] = useState("");
    const [confirmPasswordForAdmin, setConfirmPasswordForAdmin] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);

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

        // Regular expression to ensure password complexity
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

        // if (!passwordRegex.test(passwordForAdmin)) {
        //     toast({
        //         description: "Password must include a number, lowercase, uppercase, and symbol.",
        //         variant: "destructive",
        //     });
        //     return;
        // }

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/change_password`,
                {
                    new_password: passwordForAdmin,
                    old_password: "",
                    user_id: selectedAdmin.id
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

        } catch (error) {
            setPasswordForAdmin("");
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

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${selectedUser.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const fetchUsers = async () => {
        try {
            // setIsLoading(true);
            const sortFieldsString = sortFields
                .map(({ field, order }) => `${field} ${order}`)
                .join(', ');

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
                // setError('No users found');
                return;
            }

            const data = response.data.users.map((user: User) => ({
                id: user.ID,
                email: user.Email,
                lastActive: new Date(user.LastLogin).toLocaleString(),
                created: new Date(user.CreatedAt).toLocaleString(),
                createdByName: user.CreatedByName,
            }));
            setUsers(data);
            setTotalPages(response.data.total_pages || 1);
            setTotalCount(response.data.total_count || 0);
            setActiveCount(response.data.active_count || 0);
            // setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            // setError('Failed to load users');
        }
        // finally {
        // setIsLoading(false);
        // }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [token, currentPage, pageSize, searchTerm, sortFields]);

    const toggleSort = (field: SortField) => {
        setSortFields((prevSortFields) => {
            const newSortFields = prevSortFields.map((sortField) => {
                if (sortField.field === field) {
                    return { field, order: sortField.order === 'asc' ? 'desc' : 'asc' as SortOrder };
                }
                return sortField;
            });

            // Move the clicked field to the front
            const clickedField = newSortFields.find((sortField) => sortField.field === field);
            const otherFields = newSortFields.filter((sortField) => sortField.field !== field);

            return [clickedField!, ...otherFields];
        });
    };

    return (
        <div className="p-6 space-y-2">
            <div className="flex-1 overflow-auto pb-20">
                <div className="flex justify-between items-center pt-2 pl-4">
                    <Input
                        placeholder="by username"
                        className="max-w-xs placeholder-gray"
                        value={searchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleSearch(value);
                        }}
                    />
                    <Toaster />
                </div>

                <div className="overflow-x-auto p-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-400 hover:bg-gray-400">
                                <TableHead className="text-center text-black font-bold">Name</TableHead>
                                <TableHead className="text-center text-black font-bold">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('last_login')}
                                        className="font-bold text-black hover:bg-gray-500"
                                    >
                                        Last Active
                                        {sortFields.find((sortField) => sortField.field === 'last_login')?.order === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center text-black font-bold">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('created_at')}
                                        className="font-bold text-black hover:bg-gray-500"
                                    >
                                        Created
                                        {sortFields.find((sortField) => sortField.field === 'created_at')?.order === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center text-black font-bold">Created By Admin</TableHead>
                                <TableHead className="text-center text-black font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>

                            {users.map((user) => (
                                <TableRow key={user.email}>
                                    <TableCell className="px-2 py-1 text-center">{user.email}</TableCell>
                                    <TableCell className="px-2 py-1 text-center">{user.lastActive}</TableCell>
                                    <TableCell className="px-2 py-1 text-center">{user.created}</TableCell>
                                    <TableCell className="px-2 py-1 text-center">{user.createdByName}</TableCell>
                                    <TableCell className="px-2 py-1 space-x-2 text-center">
                                        <Button variant="secondary" className="shadow appearance-non bg-yellow-100 hover:bg-yellow-200 text-yellow-800" onClick={() => router.push(`/admin/user/${user.id}`)}>
                                            <ZoomIn className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="shadow appearance-non bg-blue-100 hover:bg-blue-200 text-blue-800"
                                            onClick={() => handleChangePasswordClick(user)}
                                        >
                                            <Key className="w-4 h-4 mr-2" />
                                            Change Password
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="shadow appearance-non bg-white border border-red-500 text-red-500 hover:bg-red-100"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            <Trash className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>


                    <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Password for {selectedAdmin?.email}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <PasswordInput
                                    id="password"
                                    placeholder="New Password"
                                    value={passwordForAdmin}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPasswordForAdmin(value.replace(/\s/g, '')); // Remove spaces
                                    }}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                />
                                <PasswordInput
                                    id="password"
                                    placeholder="Confirm Password"
                                    value={confirmPasswordForAdmin}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setConfirmPasswordForAdmin(value.replace(/\s/g, '')); // Remove spaces
                                    }}
                                    showPassword={showCPassword}
                                    setShowPassword={setShowCPassword}
                                />
                            </div>
                            <DialogFooter>
                                <Button className="shadow appearance-non w-1/2 bg-white border border-yellow-500 text-yellow-500 hover:bg-yellow-100" variant="secondary" onClick={() => {
                                    setIsChangePasswordDialogOpen(false);
                                    setPasswordForAdmin("");
                                    setConfirmPasswordForAdmin("");
                                    setSelectedAdmin(null);
                                }}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    className={`w-1/2  font-bold shadow appearance-non w-1/2 text-black ${!passwordForAdmin || !confirmPasswordForAdmin
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-[#ffeeac] hover:bg-yellow-300"
                                        }`}
                                    disabled={!passwordForAdmin || !confirmPasswordForAdmin}
                                    onClick={handleChangePasswordSubmit}>
                                    Submit
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isDialogDeleteOpen} onOpenChange={setIsDialogDeleteOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Confirmation</DialogTitle>
                            </DialogHeader>
                            <p>Are you sure you want to delete user {selectedUser?.email}?</p>
                            <DialogFooter>
                                <Button className='shadow appearance-non w-1/2 bg-white border border-yellow-500 text-yellow-500 hover:bg-yellow-100' variant="secondary" onClick={() => setIsDialogDeleteOpen(false)}>Cancel</Button>
                                <Button variant="destructive" className='shadow appearance-non w-1/2' onClick={handleDeleteConfirm}>Confirm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <PaginationComponent
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    totalCount={totalCount}
                    activeCount={activeCount}
                    pageSize={pageSize}
                />
            </div>

            <FooterAdminNav />
        </div>
    )
}

export default EmailManagement;