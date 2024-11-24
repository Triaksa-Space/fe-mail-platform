"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import DropdownMenuComponent from "@/components/DropdownMenuComponent"

interface User {
    email: string
    lastLogin: string
    created: string
}

const users: User[] = [
    { email: "surya1@mailria.com", lastLogin: "Just now", created: "10 Sep 24" },
    { email: "surya2@mailria.com", lastLogin: "1 Hour ago", created: "10 Sep 24" },
    { email: "surya3@mailria.com", lastLogin: "2 Hours ago", created: "10 Sep 24" },
    { email: "surya4@mailria.com", lastLogin: "1 Day ago", created: "10 Sep 24" },
    { email: "surya5@mailria.com", lastLogin: "2 Days ago", created: "10 Sep 24" },
    { email: "surya5@mailria.com", lastLogin: "30 Days ago", created: "10 Sep 24" },
    { email: "surya6@mailria.com", lastLogin: "100 Days ago", created: "10 Sep 24" },
    { email: "surya7@mailria.com", lastLogin: "200 Days ago", created: "10 Sep 24" },
    { email: "surya8@mailria.com", lastLogin: "1000 Days ago", created: "10 Sep 24" },
    { email: "surya9@mailria.com", lastLogin: "1000 Days ago", created: "10 Sep 24" },
    { email: "surya10@mailria.com", lastLogin: "1000 Days ago", created: "10 Sep 24" },
]

export default function AdminDashboard() {
    const [currentPage, setCurrentPage] = useState(1)
    const totalUsers = 1200
    const totalPages = Math.ceil(totalUsers / 10)
    const router = useRouter()

    return (
        <div className="min-h-screen bg-white">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Admin Panel dashboard</h1>
                    <DropdownMenuComponent />
                </div>
                <p className="text-lg">Total Email Active: {totalUsers}</p>
            </div>

            <div className="p-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.lastLogin}</TableCell>
                                    <TableCell>{user.created}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers}
                    </p>
                    <div className="flex gap-1">
                        {[1, 2, 3, "....", totalPages].map((page, index) => (
                            <Button
                                key={index}
                                variant={currentPage === page ? "default" : "outline"}
                                className={page === "...." ? "cursor-default" : ""}
                                onClick={() => {
                                    if (typeof page === "number") {
                                        setCurrentPage(page)
                                    }
                                }}
                                disabled={page === "...."}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

