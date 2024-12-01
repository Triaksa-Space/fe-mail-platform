// FILE: app/admin/page.tsx

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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster";
import withAuth from "@/components/hoc/withAuth";

interface EmailUser {
    id: number
    email: string
    lastActive: string
    created: string
}

type SortField = 'lastActive' | 'created'
type SortOrder = 'asc' | 'desc'

const EmailManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<EmailUser[]>([])
    const [sortField, setSortField] = useState<SortField>('lastActive')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pageInput, setPageInput] = useState("");

    const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<EmailUser | null>(null);

    const handleDeleteClick = (user: EmailUser) => {
        setSelectedUser(user);
        setIsDialogDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        try {
            await axios.delete(`http://localhost:8080/user/${selectedUser.id}`, {
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
                className: "bg-green-500 text-white border-0",
            });
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handlePageInputSubmit = () => {
        const page = parseInt(pageInput);
        if (page && page > 3 && page < totalPages) {
            handlePageChange(page);
        }
        setIsDialogOpen(false);
        setPageInput("");
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/user/?page=' + currentPage + '&page_size=' + pageSize + '&email=' + searchTerm, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                const data = response.data.users.map((user: any) => ({
                    id: user.ID,
                    email: user.Email,
                    lastActive: new Date(user.LastLogin).toLocaleString(),
                    created: new Date(user.CreatedAt).toLocaleDateString(),
                }))
                setUsers(data)
                setTotalPages(response.data.total_pages)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch users:', err)
                setError('Failed to load users')
            } finally {
                setIsLoading(false)
            }
        }

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="p-6 space-y-2">
            <div className="flex justify-between items-center pl-4">
                <Input placeholder="by username" className="max-w-xs" value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)} />
                    <Toaster />
            </div>

            <div className="overflow-x-auto p-4">
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-400 hover:bg-gray-400">
                                <TableHead className="text-center text-black font-bold">Name</TableHead>
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
                                <TableHead className="text-center text-black font-bold">
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleSort('created')}
                                        className="font-bold text-black hover:bg-gray-500"
                                    >
                                        Created
                                        {sortField === 'created' && (
                                            sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                </TableHead>
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
                                        <Button variant="secondary" className="bg-yellow-200 hover:bg-yellow-300" onClick={() => router.push(`/admin/user/${user.id}`)}>
                                            View
                                        </Button>
                                        <Button
                                            variant="destructive"
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
                        <p>Are you sure you want to delete user {selectedUser?.email}?</p>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDialogDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex justify-between pl-4">
                <span className="text-sm text-gray-500">Showing {users.length} of {totalPages * pageSize}</span>
                <Pagination className="ml-auto">
                    <PaginationContent>
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink onClick={() => handlePageChange(i + 1)}>{i + 1}</PaginationLink>
                            </PaginationItem>
                        ))}
                        {totalPages > 3 && (
                            <>
                                <PaginationItem>
                                    <PaginationEllipsis onClick={() => setIsDialogOpen(true)} className="cursor-pointer" />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink onClick={() => handlePageChange(totalPages)}>
                                        {totalPages}
                                    </PaginationLink>
                                </PaginationItem>
                            </>
                        )}
                    </PaginationContent>
                </Pagination>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Go to Page</DialogTitle>
                        </DialogHeader>
                        <Input
                            type="number"
                            min={4}
                            max={totalPages - 1}
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            placeholder="Enter page number"
                        />
                        <DialogFooter>
                            <Button onClick={handlePageInputSubmit}>Go</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <FooterAdminNav />
        </div>
    )
}

export default withAuth(EmailManagement);