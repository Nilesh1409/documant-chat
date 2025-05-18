"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { documentService } from "@/services/document-service"
import { getFileIcon } from "@/lib/file-icons"
import { MoreVertical, Pencil, Trash, Download, History, Users, Tag } from "lucide-react"

interface DocumentCardProps {
  document: any
  onDelete: () => void
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const FileIcon = getFileIcon(document.fileType)

  const isOwner = user?._id === (typeof document.createdBy === "string" ? document.createdBy : document.createdBy._id)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return
    }

    try {
      setIsDeleting(true)
      await documentService.deleteDocument(document._id, user?._id || "")
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      })
      onDelete()
    } catch (error: any) {
      console.error("Error deleting document:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete document",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className="bg-muted rounded p-2 mt-1">
              <FileIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold line-clamp-1">
                <Link href={`/documents/${document._id}`} className="hover:underline">
                  {document.title}
                </Link>
              </CardTitle>
              <CardDescription className="mt-1">
                {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
                {" · "}
                {typeof document.createdBy === "string"
                  ? "Unknown user"
                  : document.createdBy.fullName || document.createdBy.email}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/documents/${document._id}`}>
                  <FileIcon className="mr-2 h-4 w-4" />
                  <span>View document</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={document.fileUrl} target="_blank">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/documents/${document._id}/versions`}>
                  <History className="mr-2 h-4 w-4" />
                  <span>Version history</span>
                </Link>
              </DropdownMenuItem>

              {isOwner && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href={`/documents/${document._id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={`/documents/${document._id}/permissions`}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Manage permissions</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {document.description || "No description provided."}
        </p>
      </CardContent>

      <CardFooter>
        <div className="flex flex-wrap gap-2">
          {document.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/documents?tags=${tag}`}
              className="flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs hover:bg-muted/80"
            >
              <Tag className="h-3 w-3" />
              <span>{tag}</span>
            </Link>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
