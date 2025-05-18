"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { documentService } from "@/services/document-service"
import { userService } from "@/services/user-service"
import { ArrowLeft, Users, Trash, UserPlus, Loader2 } from "lucide-react"

export default function DocumentPermissionsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [document, setDocument] = useState<any>(null)
  const [permissions, setPermissions] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingPermission, setIsAddingPermission] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedPermission, setSelectedPermission] = useState<string>("read")

  useEffect(() => {
    fetchDocument()
    fetchPermissions()
    fetchUsers()
  }, [params.id])

  const fetchDocument = async () => {
    try {
      const response = await documentService.getDocumentById(params.id)
      setDocument(response.document)
    } catch (error: any) {
      console.error("Error fetching document:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load document",
      })
      router.push("/documents")
    }
  }

  const fetchPermissions = async () => {
    try {
      const permissions = await documentService.getDocumentPermissions(params.id)
      setPermissions(permissions)
    } catch (error: any) {
      console.error("Error fetching permissions:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load permissions",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({})
      setAllUsers(response.users)
    } catch (error: any) {
      console.error("Error fetching users:", error)
    }
  }

  const handleAddPermission = async () => {
    if (!selectedUser || !selectedPermission) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a user and permission type",
      })
      return
    }

    try {
      setIsAddingPermission(true)

      await documentService.addDocumentPermission(
        params.id,
        {
          userId: selectedUser,
          permissionType: selectedPermission as any,
        },
        user?._id || "",
      )

      toast({
        title: "Permission added",
        description: "The permission has been added successfully.",
      })

      // Reset form
      setSelectedUser("")
      setSelectedPermission("read")

      // Refresh permissions
      fetchPermissions()
    } catch (error: any) {
      console.error("Error adding permission:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add permission",
      })
    } finally {
      setIsAddingPermission(false)
    }
  }

  const handleRemovePermission = async (permissionId: string) => {
    try {
      await documentService.removeDocumentPermission(params.id, permissionId, user?._id || "")

      toast({
        title: "Permission removed",
        description: "The permission has been removed successfully.",
      })

      // Refresh permissions
      fetchPermissions()
    } catch (error: any) {
      console.error("Error removing permission:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove permission",
      })
    }
  }

  const isOwner =
    user &&
    document &&
    user._id === (typeof document.createdBy === "string" ? document.createdBy : document.createdBy._id)

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href={`/documents/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to document
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">Document not found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            The document you are trying to manage permissions for does not exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to documents
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">Access Denied</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            You do not have permission to manage permissions for this document.
          </p>
          <Button asChild>
            <Link href={`/documents/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to document
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Filter out users who already have permissions and the document owner
  const availableUsers = allUsers.filter((u) => {
    const isDocumentOwner =
      u._id === (typeof document.createdBy === "string" ? document.createdBy : document.createdBy._id)

    const alreadyHasPermission = permissions.some((p) => {
      const permissionUserId = typeof p.userId === "string" ? p.userId : p.userId._id
      return permissionUserId === u._id
    })

    return !isDocumentOwner && !alreadyHasPermission
  })

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/documents/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to document
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Permissions</h1>
          <p className="text-muted-foreground">Control who can access "{document.title}"</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Permissions</CardTitle>
            <CardDescription>Add or remove user permissions for this document</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.fullName || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[180px]">
                  <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="write">Write</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddPermission} disabled={isAddingPermission || !selectedUser}>
                  {isAddingPermission ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>

              <div className="border rounded-md">
                <div className="py-3 px-4 text-sm font-medium border-b bg-muted">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">User</div>
                    <div className="col-span-4">Permission</div>
                    <div className="col-span-3">Actions</div>
                  </div>
                </div>

                <div className="divide-y">
                  {/* Document owner */}
                  <div className="py-3 px-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 flex items-center">
                        <div className="font-medium">
                          {typeof document.createdBy === "string"
                            ? "Unknown user"
                            : document.createdBy.fullName || document.createdBy.email}
                        </div>
                      </div>
                      <div className="col-span-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          Owner
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs text-muted-foreground">Cannot modify</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  {permissions.length > 0 ? (
                    permissions.map((permission) => {
                      const permissionUser =
                        typeof permission.userId === "string"
                          ? { _id: permission.userId, email: "Unknown user" }
                          : permission.userId

                      return (
                        <div key={permission._id} className="py-3 px-4">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-5 flex items-center">
                              <div className="font-medium">{permissionUser.fullName || permissionUser.email}</div>
                            </div>
                            <div className="col-span-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  permission.permissionType === "read"
                                    ? "bg-blue-100 text-blue-800"
                                    : permission.permissionType === "write"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {permission.permissionType.charAt(0).toUpperCase() + permission.permissionType.slice(1)}
                              </span>
                            </div>
                            <div className="col-span-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemovePermission(permission._id)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">
                      <Users className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
                      <p>No additional permissions</p>
                      <p className="text-sm">Only you have access to this document</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
