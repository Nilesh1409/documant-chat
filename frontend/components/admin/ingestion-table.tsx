"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { ingestionService } from "@/services/ingestion-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Pagination from "@/components/pagination"
import { format } from "date-fns"
import { AlertCircle, Eye, FileText, RefreshCw } from "lucide-react"

export default function IngestionTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [jobs, setJobs] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  // Extract query parameters
  const page = Number(searchParams.get("page") || 1)
  const status = searchParams.get("status") || ""

  useEffect(() => {
    setStatusFilter(status)
    fetchJobs()
  }, [page, status])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)

      const response = await ingestionService.getIngestionJobs({
        page,
        limit: 10,
        status: status || undefined,
      })

      setJobs(response.jobs)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error("Error fetching ingestion jobs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load ingestion jobs",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)

    const params = new URLSearchParams(searchParams.toString())

    if (value !== "all") {
      params.set("status", value)
    } else {
      params.delete("status")
    }

    params.set("page", "1") // Reset to first page
    router.push(`/admin?tab=ingestion&${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/admin?tab=ingestion&${params.toString()}`)
  }

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      await ingestionService.updateIngestionJobStatus(jobId, {
        status: newStatus as any,
      })

      toast({
        title: "Status updated",
        description: `Job status updated to ${newStatus}.`,
      })

      fetchJobs()
    } catch (error: any) {
      console.error("Error updating job status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update job status",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Processing
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-full sm:w-[180px]">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={fetchJobs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job) => {
                  const document =
                    typeof job.documentId === "string"
                      ? { _id: job.documentId, title: "Unknown document" }
                      : job.documentId

                  return (
                    <TableRow key={job._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-muted rounded p-1">
                            <FileText className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium">{document.title}</div>
                            <div className="text-xs text-muted-foreground">ID: {document._id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{format(new Date(job.startedAt), "PPp")}</TableCell>
                      <TableCell>{job.completedAt ? format(new Date(job.completedAt), "PPp") : "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/documents/${document._id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Document
                            </Link>
                          </Button>

                          {job.status === "failed" && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(job._id, "pending")}>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Retry
                            </Button>
                          )}

                          {job.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(job._id, "processing")}
                            >
                              Start Processing
                            </Button>
                          )}
                        </div>

                        {job.status === "failed" && job.errorMessage && (
                          <div className="flex items-center text-xs text-red-500 mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {job.errorMessage}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No ingestion jobs found
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
