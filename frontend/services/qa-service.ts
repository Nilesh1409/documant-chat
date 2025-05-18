import axios from "axios";
import { getAuthToken } from "@/lib/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Source {
  documentId: string;
  title: string;
  excerpts: string[];
  metadata?: {
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
  };
}

export interface QAHistoryItem {
  _id: string;
  userId: string;
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low" | "none";
  sources: Source[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface QAResponse {
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low" | "none";
  sources: Source[];
}

export const qaService = {
  async askQuestion(question: string): Promise<QAResponse> {
    try {
      const response = await api.post("/api/qa/ask", { question });
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to get answer");
      }
      throw error;
    }
  },

  async getHistory(
    page = 1,
    limit = 10
  ): Promise<{ history: QAHistoryItem[]; pagination: Pagination }> {
    try {
      const response = await api.get("/api/qa/history", {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to get history");
      }
      throw error;
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      await api.delete(`/api/qa/history/${id}`);
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to delete history item"
        );
      }
      throw error;
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await api.delete("/api/qa/history");
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to clear history"
        );
      }
      throw error;
    }
  },

  async indexDocument(documentId: string): Promise<void> {
    try {
      await api.post(`/api/qa/index/${documentId}`);
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to index document"
        );
      }
      throw error;
    }
  },
};
