'use client'

import { useState } from 'react'
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
import { Settings, Plus, Database, LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react'

interface EmailUser {
  email: string
  lastActive: string
  created: string
}

type SortField = 'lastActive' | 'created'
type SortOrder = 'asc' | 'desc'

export default function EmailManagement() {
  const [sortField, setSortField] = useState<SortField>('lastActive')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const users: EmailUser[] = [
    { email: "surya1@mailria.com", lastActive: "Just now", created: "10 Sep 2024" },
    { email: "surya2@mailria.com", lastActive: "1 Hour ago", created: "10 Sep 2024" },
    { email: "surya3@mailria.com", lastActive: "2 Hours ago", created: "10 Sep 2024" },
    { email: "surya4@mailria.com", lastActive: "1 Day ago", created: "10 Sep 2024" },
    { email: "surya5@mailria.com", lastActive: "2 Days ago", created: "10 Sep 2024" },
    { email: "surya6@mailria.com", lastActive: "30 Days ago", created: "10 Sep 2024" },
    { email: "surya7@mailria.com", lastActive: "100 Days ago", created: "10 Sep 2024" },
    { email: "surya8@mailria.com", lastActive: "200 Days ago", created: "10 Sep 2024" },
    { email: "surya9@mailria.com", lastActive: "1000 Days ago", created: "10 Sep 2024" },
    { email: "surya10@mailria.com", lastActive: "1000 Days ago", created: "10 Sep 2024" },
  ]

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

  return (
    <div className="p-6 space-y-2">
      <div className="flex justify-between items-center pl-4">
        <Input placeholder="by username" className="max-w-xs" />
      </div>

      <div className="overflow-x-auto p-4">
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
                  <Button variant="secondary" className="bg-yellow-200 hover:bg-yellow-300">
                    View
                  </Button>
                  <Button variant="destructive">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between pl-4">
        <span className="w-1/2 text-sm text-gray-500">Showing 10 of 1200</span>
        <Pagination className="w-1/2">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>120</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="container mx-auto flex justify-around py-4">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Plus className="h-5 w-5" />
            <span className="text-xs">Create Single</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Database className="h-5 w-5" />
            <span className="text-xs">Create Bulk</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

