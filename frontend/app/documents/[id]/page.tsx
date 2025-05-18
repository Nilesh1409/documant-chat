"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { documentService } from "@/services/document-service";
import { getFileIcon } from "@/lib/file-icons";
import DocumentVersionUpload from "@/components/documents/document-version-upload";
import { qaService } from "@/services/qa-service";
import {
  ArrowLeft,
  Download,
  History,
  Users,
  Tag,
  Pencil,
  Trash,
  AlertTriangle,
  FileText,
  Clock,
  User,
  Search,
} from "lucide-react";

export default function DocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [documentData, setDocumentData] = useState<any>(null);
  const [latestVersion, setLatestVersion] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        const [{ document, latestVersion }, versions] = await Promise.all([
          documentService.getDocumentById(id),
          documentService.getDocumentVersions(id),
        ]);
        setDocumentData(document);
        setLatestVersion(latestVersion);
        setVersions(versions);
      } catch (error: any) {
        // console.error("Error fetching document or versions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load document",
        });
        router.push("/documents");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, router, toast]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(id, user?._id || "");
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
      router.push("/documents");
    } catch (error: any) {
      // console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete document",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleIndexDocument = async () => {
    setIsIndexing(true);
    try {
      await qaService.indexDocument(id);
      toast({
        title: "Document indexed",
        description: "The document has been indexed for Q&A.",
      });
    } catch (error: any) {
      // console.error("Error indexing document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to index document",
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const handleDownloadLatestVersion = useCallback(async () => {
    setIsDownloading(true);
    try {
      const blob = await documentService.downloadDocument(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = documentData?.title || `document-${id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (window.URL.revokeObjectURL) window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your document is being downloaded.",
      });
    } catch (error: any) {
      // console.error("Error downloading document:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Failed to download document",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [id, documentData?.title, toast]);

  const handleDownloadVersion = useCallback(
    async (versionNumber: number) => {
      setIsDownloading(true);
      try {
        const blob = await documentService.downloadDocumentVersion(
          id,
          versionNumber
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${
          documentData?.title || `document-${id}`
        } (v${versionNumber})`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (window.URL.revokeObjectURL) window.URL.revokeObjectURL(url);

        toast({
          title: "Download started",
          description: `Version ${versionNumber} is being downloaded.`,
        });
      } catch (error: any) {
        // console.error("Error downloading version:", error);
        toast({
          variant: "destructive",
          title: "Download failed",
          description: error.message || "Failed to download document version",
        });
      } finally {
        setIsDownloading(false);
      }
    },
    [id, documentData?.title, toast]
  );

  const isOwner =
    user &&
    documentData &&
    user._id ===
      (typeof documentData.createdBy === "string"
        ? documentData.createdBy
        : documentData.createdBy._id);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to documents
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="border rounded-lg p-6">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-yellow-100 p-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium">Document not found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            The document you are looking for does not exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to documents
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const FileIcon = getFileIcon(documentData.fileType);

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to documents
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main preview & actions */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{documentData.title}</h1>
              <p className="text-muted-foreground">
                Last updated{" "}
                {formatDistanceToNow(new Date(documentData.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadLatestVersion}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download"}
              </Button>

              {isOwner && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/documents/${documentData._id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="versions">
                Versions ({versions.length})
              </TabsTrigger>
            </TabsList>

            {/* Preview */}
            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto bg-muted rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                    <FileIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {documentData.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {documentData.fileType} •{" "}
                    {(documentData.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    onClick={handleDownloadLatestVersion}
                    disabled={isDownloading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? "Downloading..." : "Download to view"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Versions */}
            <TabsContent value="versions" className="mt-4">
              <div className="border rounded-lg p-4">
                {isOwner && (
                  <div className="mb-6">
                    <DocumentVersionUpload
                      documentId={documentData._id}
                      onSuccess={() => {
                        // refresh both
                        fetchDocument();
                        fetchVersions();
                      }}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {versions.length > 0 ? (
                    versions.map((version) => (
                      <div
                        key={version._id}
                        className="flex items-start border-b last:border-0 pb-4 last:pb-0"
                      >
                        <div className="bg-muted rounded-full p-2 mr-4 mt-1">
                          <History className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-medium">
                                Version {version.versionNumber}
                                {version.versionNumber ===
                                  latestVersion?.versionNumber && (
                                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                                    Latest
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(version.createdAt),
                                  "PPP 'at' p"
                                )}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadVersion(version.versionNumber)
                              }
                              disabled={isDownloading}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {isDownloading ? "Downloading..." : "Download"}
                            </Button>
                          </div>
                          {version.changeSummary && (
                            <p className="text-sm mt-2">
                              {version.changeSummary}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploaded by{" "}
                            {typeof version.createdBy === "string"
                              ? "Unknown user"
                              : version.createdBy.fullName ||
                                version.createdBy.email}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No versions found</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentData.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {documentData.description}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium mb-1">Owner</h4>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {typeof documentData.createdBy === "string"
                      ? "Unknown user"
                      : documentData.createdBy.fullName ||
                        documentData.createdBy.email}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(documentData.createdAt), "PPP")}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">File Type</h4>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {documentData.fileType.split("/")[1]?.toUpperCase() ||
                      documentData.fileType}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">File Size</h4>
                <p className="text-sm text-muted-foreground">
                  {(documentData.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </CardContent>
          </Card>

          {documentData.tags?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {documentData.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/documents?tags=${tag}`}
                      className="flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm hover:bg-muted/80"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href={`/documents/${documentData._id}/permissions`}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage permissions
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href={`/documents/${documentData._id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit document
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Remove document
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleIndexDocument}
                  disabled={isIndexing}
                >
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    {isIndexing ? "Indexing..." : "Index for Q&A"}
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
