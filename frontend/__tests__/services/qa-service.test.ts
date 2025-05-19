import { qaService } from "@/services/qa-service";
import axios from "axios";
import { jest } from "@jest/globals";

// Mock the axios module
jest.mock("axios", () => {
  const mockAxios = {
    post: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    get: jest.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: jest.fn(() => Promise.resolve({ data: { success: true } })),
    create: jest.fn().mockReturnThis(),
    defaults: {
      headers: {
        common: {},
      },
    },
  };
  return mockAxios;
});

jest.mock("@/lib/auth", () => ({
  getAuthToken: jest.fn(() => "test-token"),
}));

describe("QA Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("askQuestion", () => {
    it("should send a question and return the answer", async () => {
      // Call askQuestion function
      const result = await qaService.askQuestion(
        "What is the capital of France?"
      );

      // Mock API response
      const mockResponse = {
        data: {
          data: {
            question: "What is the capital of France?",
            answer: "The capital of France is Paris.",
            confidence: "high",
            sources: [
              {
                documentId: "doc1",
                title: "European Capitals",
                excerpts: ["Paris is the capital of France."],
                metadata: {
                  author: "Geography Expert",
                  createdAt: "2023-01-01T00:00:00.000Z",
                  tags: ["europe", "capitals"],
                },
              },
            ],
          },
        },
      }(
        // Setup the mock response
        axios.post as jest.Mock
      ).mockResolvedValueOnce(mockResponse);

      // Verify API was called correctly
      expect(axios.post).toHaveBeenCalledWith("/api/qa/ask", {
        question: "What is the capital of France?",
      });

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data);
    });

    it("should handle errors when asking a question", async () => {
      // Call askQuestion function and expect it to throw
      await expect(qaService.askQuestion("Invalid question?")).rejects.toThrow(
        "Failed to get answer"
      );

      // Mock API error response
      const errorMessage = "Failed to get answer";
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }(
        // Setup the mock to reject
        axios.post as jest.Mock
      ).mockRejectedValueOnce(mockErrorResponse);
    });
  });

  describe("getHistory", () => {
    it("should fetch question-answer history", async () => {
      // Call getHistory function
      const result = await qaService.getHistory(1, 10);

      // Mock API response
      const mockResponse = {
        data: {
          data: {
            history: [
              {
                _id: "qa1",
                userId: "user1",
                question: "What is the capital of France?",
                answer: "The capital of France is Paris.",
                confidence: "high",
                sources: [
                  {
                    documentId: "doc1",
                    title: "European Capitals",
                    excerpts: ["Paris is the capital of France."],
                  },
                ],
                createdAt: "2023-01-01T00:00:00.000Z",
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              pages: 1,
            },
          },
        },
      }(
        // Setup the mock response
        axios.get as jest.Mock
      ).mockResolvedValueOnce(mockResponse);

      // Verify API was called correctly
      expect(axios.get).toHaveBeenCalledWith("/api/qa/history", {
        params: { page: 1, limit: 10 },
      });

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data);
    });

    it("should handle errors when fetching history", async () => {
      // Call getHistory function and expect it to throw
      await expect(qaService.getHistory()).rejects.toThrow(
        "Failed to get history"
      );

      // Mock API error response
      const errorMessage = "Failed to get history";
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }(
        // Setup the mock to reject
        axios.get as jest.Mock
      ).mockRejectedValueOnce(mockErrorResponse);
    });
  });

  describe("deleteHistoryItem", () => {
    it("should delete a history item", async () => {
      // Call deleteHistoryItem function
      await qaService.deleteHistoryItem("qa1");

      // Mock API response
      const mockResponse = {
        data: {
          success: true,
        },
      }(
        // Setup the mock response
        axios.delete as jest.Mock
      ).mockResolvedValueOnce(mockResponse);

      // Verify API was called correctly
      expect(axios.delete).toHaveBeenCalledWith("/api/qa/history/qa1");
    });

    it("should handle errors when deleting a history item", async () => {
      // Call deleteHistoryItem function and expect it to throw
      await expect(qaService.deleteHistoryItem("qa1")).rejects.toThrow(
        "Failed to delete history item"
      );

      // Mock API error response
      const errorMessage = "Failed to delete history item";
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }(
        // Setup the mock to reject
        axios.delete as jest.Mock
      ).mockRejectedValueOnce(mockErrorResponse);
    });
  });

  describe("clearHistory", () => {
    it("should clear all history items", async () => {
      // Call clearHistory function
      await qaService.clearHistory();

      // Mock API response
      const mockResponse = {
        data: {
          success: true,
        },
      }(
        // Setup the mock response
        axios.delete as jest.Mock
      ).mockResolvedValueOnce(mockResponse);

      // Verify API was called correctly
      expect(axios.delete).toHaveBeenCalledWith("/api/qa/history");
    });

    it("should handle errors when clearing history", async () => {
      // Call clearHistory function and expect it to throw
      await expect(qaService.clearHistory()).rejects.toThrow(
        "Failed to clear history"
      );

      // Mock API error response
      const errorMessage = "Failed to clear history";
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }(
        // Setup the mock to reject
        axios.delete as jest.Mock
      ).mockRejectedValueOnce(mockErrorResponse);
    });
  });

  describe("indexDocument", () => {
    it("should index a document", async () => {
      // Call indexDocument function
      await qaService.indexDocument("doc1");

      // Mock API response
      const mockResponse = {
        data: {
          success: true,
        },
      }(
        // Setup the mock response
        axios.post as jest.Mock
      ).mockResolvedValueOnce(mockResponse);

      // Verify API was called correctly
      expect(axios.post).toHaveBeenCalledWith("/api/qa/index/doc1");
    });

    it("should handle errors when indexing a document", async () => {
      // Call indexDocument function and expect it to throw
      await expect(qaService.indexDocument("doc1")).rejects.toThrow(
        "Failed to index document"
      );

      // Mock API error response
      const errorMessage = "Failed to index document";
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }(
        // Setup the mock to reject
        axios.post as jest.Mock
      ).mockRejectedValueOnce(mockErrorResponse);
    });
  });
});
