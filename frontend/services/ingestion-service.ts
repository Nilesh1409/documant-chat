// Mock ingestion service that simulates API calls
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock ingestion job type
export type IngestionJob = {
  _id: string;
  documentId: string | any;
  status: "pending" | "processing" | "completed" | "failed";
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
};

// Mock ingestion jobs
const mockIngestionJobs: IngestionJob[] = [
  {
    _id: "ing1",
    documentId: "1",
    status: "completed",
    startedAt: "2023-01-01T00:00:00.000Z",
    completedAt: "2023-01-01T00:05:00.000Z",
    errorMessage: null,
  },
  {
    _id: "ing2",
    documentId: "2",
    status: "completed",
    startedAt: "2023-02-15T00:00:00.000Z",
    completedAt: "2023-02-15T00:06:00.000Z",
    errorMessage: null,
  },
  {
    _id: "ing3",
    documentId: "3",
    status: "completed",
    startedAt: "2023-03-10T00:00:00.000Z",
    completedAt: "2023-03-10T00:04:30.000Z",
    errorMessage: null,
  },
];

// Mock document data for populating references
const mockDocuments = [
  {
    _id: "1",
    title: "Project Report",
    filePath: "/uploads/documents/report-123456.pdf",
  },
  {
    _id: "2",
    title: "Marketing Strategy",
    filePath: "/uploads/documents/marketing-789012.docx",
  },
  {
    _id: "3",
    title: "Product Roadmap",
    filePath: "/uploads/documents/roadmap-345678.pdf",
  },
];

// Helper to populate document references
const populateDocument = (docId: string) => {
  return mockDocuments.find((d) => d._id === docId) || docId;
};

export const ingestionService = {
  // Get all ingestion jobs with pagination and filters
  async getIngestionJobs(params: {
    page?: number;
    limit?: number;
    status?: string;
    documentId?: string;
  }) {
    try {
      const response = await api.get("/api/ingestion", { params });
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch ingestion jobs"
        );
      }
      throw error;
    }
  },

  // Get ingestion job by ID
  async getIngestionJobById(id: string) {
    try {
      const response = await api.get(`/api/ingestion/${id}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch ingestion job"
        );
      }
      throw error;
    }
  },

  // Update ingestion job status
  async updateIngestionJobStatus(
    id: string,
    data: {
      status: "pending" | "processing" | "completed" | "failed";
      errorMessage?: string;
    }
  ) {
    try {
      const response = await api.put(`/api/ingestion/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to update ingestion job status"
        );
      }
      throw error;
    }
  },

  // Get document ingestion status
  async getDocumentIngestionStatus(documentId: string) {
    try {
      const response = await api.get(`/api/ingestion/document/${documentId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message ||
            "Failed to fetch document ingestion status"
        );
      }
      throw error;
    }
  },

  // Trigger document ingestion
  async triggerDocumentIngestion(documentId: string) {
    try {
      const response = await api.post(`/api/ingestion/document/${documentId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to trigger document ingestion"
        );
      }
      throw error;
    }
  },
};
