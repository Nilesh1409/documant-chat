// Mock document service that simulates API calls
import axios from "axios";
import type { User } from "@/providers/auth-provider";
import { api } from "@/lib/api";

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Mock document types
export type Document = {
  _id: string;
  title: string;
  description: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdBy: string | User;
  isDeleted: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  url?: string;
  fileUrl?: string;
};

export type DocumentVersion = {
  _id: string;
  documentId: string;
  versionNumber: number;
  filePath: string;
  createdBy: string | User;
  changeSummary: string;
  createdAt: string;
  fileUrl?: string;
};

export type DocumentPermission = {
  _id: string;
  documentId: string;
  userId: string | User;
  permissionType: "read" | "write" | "admin";
  createdAt: string;
};

// Mock document database
const mockDocuments: Document[] = [
  {
    _id: "1",
    title: "Project Report",
    description: "Annual project report for 2023",
    filePath: "/uploads/documents/report-123456.pdf",
    fileType: "application/pdf",
    fileSize: 1024000,
    createdBy: "1", // Admin user
    isDeleted: false,
    tags: ["report", "annual", "2023"],
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    title: "Marketing Strategy",
    description: "Marketing strategy document for Q2",
    filePath: "/uploads/documents/marketing-789012.docx",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 512000,
    createdBy: "2", // Editor user
    isDeleted: false,
    tags: ["marketing", "strategy", "Q2"],
    createdAt: "2023-02-15T00:00:00.000Z",
    updatedAt: "2023-02-15T00:00:00.000Z",
  },
  {
    _id: "3",
    title: "Product Roadmap",
    description: "Product development roadmap for 2023-2024",
    filePath: "/uploads/documents/roadmap-345678.pdf",
    fileType: "application/pdf",
    fileSize: 768000,
    createdBy: "1", // Admin user
    isDeleted: false,
    tags: ["product", "roadmap", "development"],
    createdAt: "2023-03-10T00:00:00.000Z",
    updatedAt: "2023-03-10T00:00:00.000Z",
  },
];

// Generate more mock documents for pagination testing
for (let i = 4; i <= 20; i++) {
  mockDocuments.push({
    _id: String(i),
    title: `Document ${i}`,
    description: `Description for document ${i}`,
    filePath: `/uploads/documents/doc-${i}.pdf`,
    fileType:
      i % 2 === 0
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 500000 + i * 10000,
    createdBy: String((i % 3) + 1), // Cycle through users 1, 2, 3
    isDeleted: false,
    tags: [`tag${i}`, "document"],
    createdAt: new Date(2023, 0, i).toISOString(),
    updatedAt: new Date(2023, 0, i).toISOString(),
  });
}

// Mock document versions
const mockVersions: DocumentVersion[] = [
  {
    _id: "v1",
    documentId: "1",
    versionNumber: 1,
    filePath: "/uploads/documents/report-123456.pdf",
    createdBy: "1",
    changeSummary: "Initial version",
    createdAt: "2023-01-01T00:00:00.000Z",
  },
  {
    _id: "v2",
    documentId: "1",
    versionNumber: 2,
    filePath: "/uploads/documents/report-123456-v2.pdf",
    createdBy: "1",
    changeSummary: "Updated content and fixed typos",
    createdAt: "2023-01-15T00:00:00.000Z",
  },
  {
    _id: "v3",
    documentId: "2",
    versionNumber: 1,
    filePath: "/uploads/documents/marketing-789012.docx",
    createdBy: "2",
    changeSummary: "Initial version",
    createdAt: "2023-02-15T00:00:00.000Z",
  },
  {
    _id: "v4",
    documentId: "3",
    versionNumber: 1,
    filePath: "/uploads/documents/roadmap-345678.pdf",
    createdBy: "1",
    changeSummary: "Initial version",
    createdAt: "2023-03-10T00:00:00.000Z",
  },
];

// Mock document permissions
const mockPermissions: DocumentPermission[] = [
  {
    _id: "p1",
    documentId: "1",
    userId: "2", // Editor user
    permissionType: "read",
    createdAt: "2023-01-02T00:00:00.000Z",
  },
  {
    _id: "p2",
    documentId: "1",
    userId: "3", // Viewer user
    permissionType: "read",
    createdAt: "2023-01-02T00:00:00.000Z",
  },
  {
    _id: "p3",
    documentId: "2",
    userId: "1", // Admin user
    permissionType: "write",
    createdAt: "2023-02-16T00:00:00.000Z",
  },
  {
    _id: "p4",
    documentId: "2",
    userId: "3", // Viewer user
    permissionType: "read",
    createdAt: "2023-02-16T00:00:00.000Z",
  },
  {
    _id: "p5",
    documentId: "3",
    userId: "2", // Editor user
    permissionType: "write",
    createdAt: "2023-03-11T00:00:00.000Z",
  },
];

// Mock user data for populating references
const mockUsers = [
  {
    _id: "1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    fullName: "Admin User",
  },
  {
    _id: "2",
    email: "editor@example.com",
    firstName: "Editor",
    lastName: "User",
    role: "editor",
    fullName: "Editor User",
  },
  {
    _id: "3",
    email: "viewer@example.com",
    firstName: "Viewer",
    lastName: "User",
    role: "viewer",
    fullName: "Viewer User",
  },
];

// Helper to populate user references
const populateUser = (userId: string) => {
  return mockUsers.find((u) => u._id === userId) || userId;
};

// Helper to add URLs to documents
const addDocumentUrls = (doc: Document) => {
  return {
    ...doc,
    url: `/documents/${doc._id}`,
    fileUrl: doc.filePath,
  };
};

// Helper to add URLs to versions
const addVersionUrls = (version: DocumentVersion) => {
  return {
    ...version,
    fileUrl: version.filePath,
  };
};

export const documentService = {
  // Get all documents with pagination, search, and filters
  async getDocuments(params: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
    userId?: string;
  }) {
    try {
      const response = await api.get("/api/documents", { params });
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch documents"
        );
      }
      throw error;
    }
  },

  // Get document by ID
  async getDocumentById(id: string) {
    try {
      const response = await api.get(`/api/documents/${id}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch document"
        );
      }
      throw error;
    }
  },

  // Create a new document
  async createDocument(data: {
    title: string;
    description?: string;
    tags?: string[];
    file: File;
    userId: string;
  }) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", data.title);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
      }

      formData.append("file", data.file);

      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to create document"
        );
      }
      throw error;
    }
  },

  // Update document metadata
  async updateDocument(
    id: string,
    data: {
      title?: string;
      description?: string;
      tags?: string[];
    },
    userId: string
  ) {
    try {
      const response = await api.put(`/api/documents/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to update document"
        );
      }
      throw error;
    }
  },

  // Delete document (soft delete)
  async deleteDocument(id: string, userId: string) {
    try {
      const response = await api.delete(`/api/documents/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to delete document"
        );
      }
      throw error;
    }
  },

  // Delete document permanently (admin only)
  async deleteDocumentPermanently(id: string) {
    try {
      const response = await api.delete(`/api/documents/${id}/permanent`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to permanently delete document"
        );
      }
      throw error;
    }
  },

  // Upload new version
  async uploadNewVersion(
    id: string,
    data: {
      file: File;
      changeSummary?: string;
      userId: string;
    }
  ) {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      if (data.changeSummary) {
        formData.append("changeSummary", data.changeSummary);
      }

      formData.append("file", data.file);

      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/documents/${id}/versions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to upload new version"
        );
      }
      throw error;
    }
  },

  // Get document versions
  async getDocumentVersions(id: string) {
    try {
      const response = await api.get(`/api/documents/${id}/versions`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch document versions"
        );
      }
      throw error;
    }
  },

  // Get specific document version
  async getDocumentVersion(id: string, versionNumber: number) {
    try {
      const response = await api.get(
        `/api/documents/${id}/versions/${versionNumber}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch document version"
        );
      }
      throw error;
    }
  },

  // Get document permissions
  async getDocumentPermissions(id: string) {
    try {
      const response = await api.get(`/api/documents/${id}/permissions`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch document permissions"
        );
      }
      throw error;
    }
  },

  // Add document permission
  async addDocumentPermission(
    id: string,
    data: {
      userId: string;
      permissionType: "read" | "write" | "admin";
    },
    currentUserId: string
  ) {
    try {
      const response = await api.post(`/api/documents/${id}/permissions`, data);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to add document permission"
        );
      }
      throw error;
    }
  },

  // Remove document permission
  async removeDocumentPermission(
    id: string,
    permissionId: string,
    currentUserId: string
  ) {
    try {
      const response = await api.delete(
        `/api/documents/${id}/permissions/${permissionId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to remove document permission"
        );
      }
      throw error;
    }
  },

  downloadDocument: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/api/documents/${id}/download`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      console.error("Error downloading document:", error);
      throw error;
    }
  },

  downloadDocumentVersion: async (
    id: string,
    versionNumber: number
  ): Promise<Blob> => {
    try {
      const response = await api.get(
        `/api/documents/${id}/versions/${versionNumber}/download`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error downloading document version:", error);
      throw error;
    }
  },
};
