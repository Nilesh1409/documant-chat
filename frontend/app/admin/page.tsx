"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { userService } from "@/services/user-service";
import { documentService } from "@/services/document-service";
import { ingestionService } from "@/services/ingestion-service";
import UserTable from "@/components/admin/user-table";
import DocumentTable from "@/components/admin/document-table";
import IngestionTable from "@/components/admin/ingestion-table";
import { Users, FileText, Database } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalIngestionJobs: 0,
  });

  // Get active tab from URL or default to "users"
  const activeTab = searchParams.get("tab") || "users";

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to access the admin panel.",
      });
      router.push("/");
      return;
    }

    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      // Fetch counts for dashboard stats
      const [usersResponse, documentsResponse, ingestionResponse] =
        await Promise.all([
          userService.getUsers({}),
          documentService.getDocuments({}),
          ingestionService.getIngestionJobs({}),
        ]);

      setStats({
        totalUsers: usersResponse.pagination.total,
        totalDocuments: documentsResponse.pagination.total,
        totalIngestionJobs: ingestionResponse.pagination.total,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/admin?${params.toString()}`);
  };

  if (user && user.role !== "admin") {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">Access Denied</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            You do not have permission to access the admin panel.
          </p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, documents, and system settings
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton data-testid="skeleton" className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton data-testid="skeleton" className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ingestion Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Database className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">
                  {stats.totalIngestionJobs}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="ingestion">
            <Database className="h-4 w-4 mr-2" />
            Ingestion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserTable />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentTable />
        </TabsContent>

        <TabsContent value="ingestion">
          <IngestionTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
