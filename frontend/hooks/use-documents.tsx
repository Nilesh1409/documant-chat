"use client";

import { useState, useEffect, useCallback } from "react";
import { documentService } from "@/services/document-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import type { Document } from "@/services/document-service";

type PaginationData = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const page = searchParams.get("page") ? parseInt(searchParams.get("page") as string, 10) : 1;
      const search = searchParams.get("search") || undefined;
      const tags = searchParams.get("tags") || undefined;
      
      const result = await documentService.getDocuments({ 
        page, 
        search, 
        tags 
      });
      
      setDocuments(result.documents);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch documents";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, toast]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  const handleSearch = useCallback((searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to page 1 when searching
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);
  
  const handleTagSelect = useCallback((tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      params.set("tags", newTags.join(","));
    }
    
    params.delete("page"); // Reset to page 1 when filtering
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);
  
  const handleTagRemove = useCallback((tagToRemove: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    
    if (newTags.length > 0) {
      params.set("tags", newTags.join(","));
    } else {
      params.delete("tags");
    }
    
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);
  
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);
  
  const handleDocumentDeleted = useCallback(async (documentId: string) => {
    // Refetch documents after deletion
    await fetchDocuments();
  }, [fetchDocuments]);
  
  return {
    documents,
    pagination,
    isLoading,
    error,
    handleSearch,
    handleTagSelect,
    handleTagRemove,
    handlePageChange,
    handleDocumentDeleted,
  };
} 