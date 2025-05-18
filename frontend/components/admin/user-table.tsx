"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { userService } from "@/services/user-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Pagination from "@/components/pagination"
import CreateUserDialog from "@/components/admin/create-user-dialog"
import EditUserDialog from "@/components/admin/edit-user-dialog"
import { formatDistanceToNow } from "date-fns"
import { Edit, Search, Trash, UserPlus } from "lucide-react"

export default function UserTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  // Extract query parameters
  const page = Number(searchParams.get("page") || 1)
  const role = searchParams.get("role") || ""

  useEffect(() => {
    setRoleFilter(role || "all")
    fetchUsers()
  }, [page, role])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)

      const response = await userService.getUsers({
        page,
        limit: 10,
        role: role || undefined,
      })

      setUsers(response.users)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load users",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set("page", "1") // Reset to first page on new search

    if (roleFilter !== "all") {
      params.set("role", roleFilter)
    }

    router.push(`/admin?tab=users&${params.toString()}`)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)

    const params = new URLSearchParams(searchParams.toString())

    if (value !== "all") {
      params.set("role", value)
    } else {
      params.delete("role")
    }

    params.set("page", "1") // Reset to first page
    router.push(`/admin?tab=users&${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/admin?tab=users&${params.toString()}`)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      await userService.deleteUser(userId)
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      })
      fetchUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <Button onClick={() => setIsCreateUserOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.fullName || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : user.role === "editor"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user._id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
        </div>
      )}

      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} onSuccess={fetchUsers} />

      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSuccess={fetchUsers}
      />
    </div>
  )
}
