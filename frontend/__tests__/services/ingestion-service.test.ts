import { ingestionService } from "@/services/ingestion-service"
import axios from "axios"
import jest from "jest" // Declare the jest variable

// Mock the axios module
jest.mock("axios", () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }),
  defaults: {
    headers: {
      common: {},
    },
  },
}))

// Mock localStorage for getToken
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })

describe("Ingestion Service", () => {
  // Mock api instance
  const mockApiInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }

  beforeAll(() => {
    // Override axios.create to return our mock instance
    ;(axios.create as jest.Mock).mockReturnValue(mockApiInstance)
  })

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    localStorageMock.clear()

    // Mock auth token
    localStorageMock.setItem("auth_token", "test-token")
  })

  describe("getIngestionJobs", () => {
    it("should fetch ingestion jobs with pagination and filters", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            jobs: [
              {
                _id: "ing1",
                documentId: {
                  _id: "1",
                  title: "Test Document",
                },
                status: "completed",
                startedAt: "2023-01-01T00:00:00.000Z",
                completedAt: "2023-01-01T00:05:00.000Z",
                errorMessage: null,
              },
              {
                _id: "ing2",
                documentId: {
                  _id: "2",
                  title: "Another Document",
                },
                status: "processing",
                startedAt: "2023-01-02T00:00:00.000Z",
                completedAt: null,
                errorMessage: null,
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              pages: 1,
            },
          },
        },
      }

      mockApiInstance.get.mockResolvedValue(mockResponse)

      // Parameters
      const params = {
        page: 1,
        status: "completed",
        documentId: "1",
      }

      // Call getIngestionJobs function
      const result = await ingestionService.getIngestionJobs(params)

      // Verify API was called correctly
      expect(mockApiInstance.get).toHaveBeenCalledWith("/api/ingestion", { params })

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when fetching ingestion jobs", async () => {
      // Mock API error response
      const errorMessage = "Failed to fetch ingestion jobs"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }

      mockApiInstance.get.mockRejectedValue(mockErrorResponse)

      // Call getIngestionJobs function and expect it to throw
      await expect(ingestionService.getIngestionJobs({})).rejects.toThrow(errorMessage)
    })
  })

  describe("getIngestionJobById", () => {
    it("should fetch an ingestion job by ID", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "ing1",
            documentId: {
              _id: "1",
              title: "Test Document",
            },
            status: "completed",
            startedAt: "2023-01-01T00:00:00.000Z",
            completedAt: "2023-01-01T00:05:00.000Z",
            errorMessage: null,
          },
        },
      }

      mockApiInstance.get.mockResolvedValue(mockResponse)

      // Call getIngestionJobById function
      const result = await ingestionService.getIngestionJobById("ing1")

      // Verify API was called correctly
      expect(mockApiInstance.get).toHaveBeenCalledWith("/api/ingestion/ing1")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when fetching an ingestion job", async () => {
      // Mock API error response
      const errorMessage = "Ingestion job not found"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }

      mockApiInstance.get.mockRejectedValue(mockErrorResponse)

      // Call getIngestionJobById function and expect it to throw
      await expect(ingestionService.getIngestionJobById("invalid")).rejects.toThrow(errorMessage)
    })
  })

  describe("updateIngestionJobStatus", () => {
    it("should update ingestion job status", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "ing1",
            documentId: "1",
            status: "completed",
            startedAt: "2023-01-01T00:00:00.000Z",
            completedAt: "2023-01-01T00:05:00.000Z",
            errorMessage: null,
          },
        },
      }

      mockApiInstance.put.mockResolvedValue(mockResponse)

      // Status update data
      const updateData = {
        status: "completed",
      }

      // Call updateIngestionJobStatus function
      const result = await ingestionService.updateIngestionJobStatus("ing1", updateData)

      // Verify API was called correctly
      expect(mockApiInstance.put).toHaveBeenCalledWith("/api/ingestion/ing1", updateData)

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when updating ingestion job status", async () => {
      // Mock API error response
      const errorMessage = "Failed to update ingestion job status"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }

      mockApiInstance.put.mockRejectedValue(mockErrorResponse)

      // Status update data
      const updateData = {
        status: "failed",
        errorMessage: "Processing error",
      }

      // Call updateIngestionJobStatus function and expect it to throw
      await expect(ingestionService.updateIngestionJobStatus("ing1", updateData)).rejects.toThrow(errorMessage)
    })
  })

  describe("getDocumentIngestionStatus", () => {
    it("should fetch document ingestion status", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "ing1",
            documentId: "1",
            status: "completed",
            startedAt: "2023-01-01T00:00:00.000Z",
            completedAt: "2023-01-01T00:05:00.000Z",
            errorMessage: null,
          },
        },
      }

      mockApiInstance.get.mockResolvedValue(mockResponse)

      // Call getDocumentIngestionStatus function
      const result = await ingestionService.getDocumentIngestionStatus("1")

      // Verify API was called correctly
      expect(mockApiInstance.get).toHaveBeenCalledWith("/api/ingestion/document/1")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when fetching document ingestion status", async () => {
      // Mock API error response
      const errorMessage = "Failed to fetch document ingestion status"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }

      mockApiInstance.get.mockRejectedValue(mockErrorResponse)

      // Call getDocumentIngestionStatus function and expect it to throw
      await expect(ingestionService.getDocumentIngestionStatus("1")).rejects.toThrow(errorMessage)
    })
  })

  describe("triggerDocumentIngestion", () => {
    it("should trigger document ingestion", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "new-ing",
            documentId: "1",
            status: "pending",
            startedAt: "2023-01-01T00:00:00.000Z",
            completedAt: null,
            errorMessage: null,
          },
        },
      }

      mockApiInstance.post.mockResolvedValue(mockResponse)

      // Call triggerDocumentIngestion function
      const result = await ingestionService.triggerDocumentIngestion("1")

      // Verify API was called correctly
      expect(mockApiInstance.post).toHaveBeenCalledWith("/api/ingestion/document/1")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when triggering document ingestion", async () => {
      // Mock API error response
      const errorMessage = "Failed to trigger document ingestion"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }

      mockApiInstance.post.mockRejectedValue(mockErrorResponse)

      // Call triggerDocumentIngestion function and expect it to throw
      await expect(ingestionService.triggerDocumentIngestion("1")).rejects.toThrow(errorMessage)
    })
  })
})
