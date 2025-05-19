import axios from "axios";
import { getAuthToken } from "@/lib/auth";

// For debugging
console.log(
  "🚀 ~ process.env.NEXT_PUBLIC_API_URL:",
  process.env.NEXT_PUBLIC_API_URL
);

// Create an axios instance with base URL and default headers
const api = axios;

// Add auth token to requests
api.defaults.headers.common["Authorization"] = `Bearer ${getAuthToken()}`;

// Types
export interface QASource {
  documentId: string;
  title: string;
  excerpts: string[];
  metadata?: {
    author?: string;
    createdAt?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface QAResponse {
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low";
  sources: QASource[];
}

export interface QAHistoryItem extends QAResponse {
  _id: string;
  userId: string;
  createdAt: string;
}

export interface QAPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface QAHistoryResponse {
  history: QAHistoryItem[];
  pagination: QAPagination;
}

// QA Service
export const qaService = {
  // Ask a question and get an answer with sources
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

  // Get question-answer history with pagination
  async getHistory(page = 1, limit = 10): Promise<QAHistoryResponse> {
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

  // Delete a specific history item
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

  // Clear all history
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

  // Index a document for QA
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

export type Source = QASource;
