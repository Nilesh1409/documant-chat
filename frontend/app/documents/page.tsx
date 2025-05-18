"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { documentService } from "@/services/document-service";
import DocumentCard from "@/components/documents/document-card";
import DocumentUploadButton from "@/components/documents/document-upload-button";
import Pagination from "@/components/pagination";
import { FileText, Search, Tag, X } from "lucide-react";

export default function DocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Extract query parameters
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const tags = searchParams.get("tags") || "";

  useEffect(() => {
    // Initialize state from URL params
    setSearchTerm(search);
    if (tags) {
      setSelectedTags(tags.split(","));
    }

    fetchDocuments();
  }, [page, search, tags]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);

      const response = await documentService.getDocuments({
        page,
        limit: 10,
        search,
        tags,
        userId: user?._id,
      });

      setDocuments(response.documents);
      setPagination(response.pagination);

      // Extract unique tags from all documents
      const allTags = response.documents.flatMap((doc) => doc.tags);
      const uniqueTags = [...new Set(allTags)];
      setAvailableTags(uniqueTags);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load documents",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to first page on new search

    if (searchTerm) {
      params.set("search", searchTerm);
    }

    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }

    router.push(`/documents?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedTags([]);
    router.push("/documents");
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);

      const params = new URLSearchParams(searchParams.toString());
      params.set("tags", newTags.join(","));
      params.set("page", "1"); // Reset to first page
      router.push(`/documents?${params.toString()}`);
    }
  };

  const handleTagRemove = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);

    const params = new URLSearchParams(searchParams.toString());

    if (newTags.length > 0) {
      params.set("tags", newTags.join(","));
    } else {
      params.delete("tags");
    }

    params.set("page", "1"); // Reset to first page
    router.push(`/documents?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/documents?${params.toString()}`);
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your documents
          </p>
        </div>
        <DocumentUploadButton onSuccess={fetchDocuments} />
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="w-full sm:w-[200px]">
            <Select onValueChange={handleTagSelect} value="">
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
          {(searchTerm || selectedTags.length > 0) && (
            <Button variant="ghost" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
              >
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1 rounded-full hover:bg-background p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <DocumentCard
                key={document._id}
                document={document}
                onDelete={fetchDocuments}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No documents found</h3>
          <p className="text-muted-foreground mt-1 mb-4 max-w-md">
            {search || tags
              ? "No documents match your search criteria. Try adjusting your filters."
              : "You haven't uploaded any documents yet. Get started by uploading your first document."}
          </p>
          {!(search || tags) && <DocumentUploadButton />}
        </div>
      )}
    </div>
  );
}
