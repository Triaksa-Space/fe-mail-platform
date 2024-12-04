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
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster";
import withAuth from "@/components/hoc/withAuth";

interface AdminUser {
    id: number
    email: string
    lastActive: string
    created: string
}

interface User {
    ID: number
    Email: string
    LastLogin: string
    CreatedAt: string
}

type SortField = 'lastActive' | 'created'
type SortOrder = 'asc' | 'desc'

const UserAdminManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<AdminUser[]>([])
    const [sortField, setSortField] = useState<SortField>('lastActive')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    // const [totalPages, setTotalPages] = useState(1)
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const { toast } = useToast();
    // const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [pageInput, setPageInput] = useState("");

    const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const [isDialogCreateOpen, setIsDialogCreateOpen] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");

    const handleDeleteClick = (user: AdminUser) => {
        setSelectedUser(user);
        setIsDialogDeleteOpen(true);
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
                description: newAdminEmail + " admin deleted successfully!",
                className: "bg-green-500 text-white border-0",
            });
        } catch (error) {
            console.error('Failed to delete admin:', error);
            toast({
                title: "Error",
                description: "Failed to delete admin. Please try again.",
                className: "bg-red-500 text-white border-0",
            });
        }
    };

    const handleCreateAdmin = async () => {
        if (!newAdminEmail || !newAdminPassword) {
            toast({
                title: "Error",
                description: "Please fill all required fields",
                className: "bg-red-500 text-white border-0",
            });
            return;
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/admin`,
                {
                    username: newAdminEmail,
                    password: newAdminPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Show success toast
            toast({
                title: "Success",
                description: newAdminEmail + " admin has been successfully created!",
                className: "bg-green-500 text-white border-0",
            });

            // Close the dialog and reset the form
            setIsDialogCreateOpen(false);
            setNewAdminEmail("");
            setNewAdminPassword("");

            // Refresh the user list
            fetchUsers();
        } catch (error) {
            console.error('Failed to create admin:', error);
            toast({
                title: "Error",
                description: "Failed to create admin. Please try again.",
                className: "bg-red-500 text-white border-0",
            });
        }
    };

    // const handlePageInputSubmit = () => {
    //     const page = parseInt(pageInput);
    //     if (page && page > 3 && page < totalPages) {
    //         handlePageChange(page);
    //     }
    //     setIsDialogOpen(false);
    //     setPageInput("");
    // };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/admin?email=` + searchTerm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = response.data.users.map((user: User) => ({
                id: user.ID,
                email: user.Email,
                lastActive: new Date(user.LastLogin).toLocaleString(),
                created: new Date(user.CreatedAt).toLocaleDateString(),
            }))
            setUsers(data)
            // setTotalPages(response.data.total_pages)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch users:', err)
            setError('Failed to load users')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [token, currentPage, pageSize, searchTerm])

    const sortedUsers = [...users].sort((a, b) => {
        if (sortField === 'lastActive') {
            return sortOrder === 'asc'
                ? a.lastActive.localeCompare(b.lastActive)
                : b.lastActive.localeCompare(a.lastActive)
        } else {
            return sortOrder === 'asc'
                ? a.created.localeCompare(b.created)
                : b.created.localeCompare(a.created)
        }
    })

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('desc')
        }
    }

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page)
    // }

    const handleLogout = () => {
        // Clear token and redirect to login page
        useAuthStore.getState().setToken(null);
        router.push('/signin');
    }

    return (
        <div className="p-6 space-y-2">
            <div className="flex justify-between items-center pl-4">
                <Input placeholder="by username" className="max-w-xs" value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)} />
            </div>

            <div className="overflow-x-auto p-4">
                <Toaster />
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-400 hover:bg-gray-400">
                                <TableHead className="text-center text-black font-bold">Admin Name</TableHead>
                                <TableHead className="text-center text-black font-bold">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('lastActive')}
                                        className="font-bold text-black hover:bg-gray-500"
                                    >
                                        Last Active
                                        {sortField === 'lastActive' && (
                                            sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center text-black font-bold">Created</TableHead>
                                <TableHead className="text-center text-black font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.map((user) => (
                                <TableRow key={user.email}>
                                    <TableCell className="px-2 py-1 text-center">{user.email}</TableCell>
                                    <TableCell className="px-2 py-1 text-center">{user.lastActive}</TableCell>
                                    <TableCell className="px-2 py-1 text-center">{user.created}</TableCell>
                                    <TableCell className="px-2 py-1 space-x-2 text-center">
                                        <Button
                                            variant="destructive"
                                            className="bg-white border border-red-500 text-red-500 hover:bg-red-100"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <Dialog open={isDialogDeleteOpen} onOpenChange={setIsDialogDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Confirmation</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete admin {selectedUser?.email}?</p>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDialogDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDialogCreateOpen} onOpenChange={setIsDialogCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Admin</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Username"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                            />
                            <Input
                                placeholder="Password"
                                type="password"
                                value={newAdminPassword}
                                onChange={(e) => setNewAdminPassword(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" className='w-1/2 bg-white border border-yellow-500 text-yellow-500 hover:bg-yellow-100' onClick={() => setIsDialogCreateOpen(false)}>Back</Button>
                            <Button 
                            variant="default" 
                            className={`w-1/2  font-bold border border-black/20 text-black ${!newAdminEmail || !newAdminPassword
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-yellow-300 hover:bg-yellow-300"
                              }`}
                            disabled={!newAdminEmail || !newAdminPassword}
                            onClick={handleCreateAdmin}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="p-4">
                {/* rest of the code here */}
                <div className="flex justify-center gap-4 mt-4 mb-8">
                    <Button
                        
                        className="w-[200px] bg-gray-800 hover:bg-gray-700 text-white py-3"
                        onClick={() => setIsDialogCreateOpen(true)}
                    >
                        Create Admin
                    </Button>
                    <Button
                        
                        className="w-[200px] bg-gray-800 hover:bg-gray-700 text-white py-3"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <FooterAdminNav />
        </div>
    )
}

export default withAuth(UserAdminManagement);