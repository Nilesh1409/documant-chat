"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { documentService } from "@/services/document-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Pagination from "@/components/pagination"
import { getFileIcon } from "@/lib/file-icons"
import { formatDistanceToNow } from "date-fns"
import { Eye, Search, Trash } from "lucide-react"

export default function DocumentTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [documents, setDocuments] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Extract query parameters
  const page = Number(searchParams.get("page") || 1)
  const search = searchParams.get("search") || ""

  useEffect(() => {
    setSearchTerm(search)
    fetchDocuments()
  }, [page, search])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)

      const response = await documentService.getDocuments({
        page,
        limit: 10,
        search,
      })

      setDocuments(response.documents)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error("Error fetching documents:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load documents",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set("page", "1") // Reset to first page on new search

    if (searchTerm) {
      params.set("search", searchTerm)
    }

    router.push(`/admin?tab=documents&${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/admin?tab=documents&${params.toString()}`)
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to permanently delete this document?")) {
      return
    }

    try {
      await documentService.deleteDocumentPermanently(documentId)
      toast({
        title: "Document deleted",
        description: "The document has been permanently deleted.",
      })
      fetchDocuments()
    } catch (error: any) {
      console.error("Error deleting document:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete document",
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
              placeholder="Search documents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>
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
                <TableHead>Document</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((document) => {
                  const FileIcon = getFileIcon(document.fileType)
                  return (
                    <TableRow key={document._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-muted rounded p-1">
                            <FileIcon className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium">{document.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {document.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof document.createdBy === "string"
                          ? "Unknown user"
                          : document.createdBy.fullName || document.createdBy.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {document.fileType.split("/")[1]?.toUpperCase() || document.fileType}
                        </Badge>
                      </TableCell>
                      <TableCell>{(document.fileSize / 1024 / 1024).toFixed(2)} MB</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/documents/${document._id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(document._id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No documents found
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
    </div>
  )
}
