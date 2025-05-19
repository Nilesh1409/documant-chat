import { documentService } from "@/services/document-service"
import { api } from "@/lib/api"
import axios from "axios"
import jest from "jest" // Declare the jest variable

// Mock the axios and api modules
jest.mock("axios")
jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
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

describe("Document Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe("getDocuments", () => {
    it("should fetch documents with pagination and filters", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            documents: [
              {
                _id: "1",
                title: "Test Document",
                description: "Test description",
                filePath: "/test/path.pdf",
                fileType: "application/pdf",
                fileSize: 1024,
                createdBy: "user1",
                isDeleted: false,
                tags: ["test", "document"],
                createdAt: "2023-01-01T00:00:00.000Z",
                updatedAt: "2023-01-01T00:00:00.000Z",
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
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      // Parameters
      const params = {
        page: 1,
        search: "test",
        tags: "document",
      }

      // Call getDocuments function
      const result = await documentService.getDocuments(params)

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith("/api/documents", { params })

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when fetching documents", async () => {
      // Mock API error response
      const errorMessage = "Failed to fetch documents"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.get as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Call getDocuments function and expect it to throw
      await expect(documentService.getDocuments({})).rejects.toThrow(errorMessage)
    })
  })

  describe("getDocumentById", () => {
    it("should fetch a document by ID", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "1",
            title: "Test Document",
            description: "Test description",
            filePath: "/test/path.pdf",
            fileType: "application/pdf",
            fileSize: 1024,
            createdBy: "user1",
            isDeleted: false,
            tags: ["test", "document"],
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      // Call getDocumentById function
      const result = await documentService.getDocumentById("1")

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith("/api/documents/1")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when fetching a document", async () => {
      // Mock API error response
      const errorMessage = "Document not found"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.get as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Call getDocumentById function and expect it to throw
      await expect(documentService.getDocumentById("999")).rejects.toThrow(errorMessage)
    })
  })

  describe("createDocument", () => {
    it("should create a new document", async () => {
      // Mock token
      localStorageMock.setItem("auth_token", "test-token")

      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "new-doc",
            title: "New Document",
            description: "New description",
            filePath: "/uploads/new-doc.pdf",
            fileType: "application/pdf",
            fileSize: 2048,
            createdBy: "user1",
            isDeleted: false,
            tags: ["new", "test"],
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
        },
      }
      ;(axios.post as jest.Mock).mockResolvedValue(mockResponse)

      // Create document data
      const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
      const documentData = {
        title: "New Document",
        description: "New description",
        tags: ["new", "test"],
        file,
        userId: "user1",
      }

      // Call createDocument function
      const result = await documentService.createDocument(documentData)

      // Verify axios.post was called with FormData
      expect(axios.post).toHaveBeenCalled()

      // Get the FormData from the axios.post call
      const axiosPostCall = (axios.post as jest.Mock).mock.calls[0]
      const url = axiosPostCall[0]
      const formData = axiosPostCall[1]
      const config = axiosPostCall[2]

      // Verify URL
      expect(url).toContain("/api/documents")

      // Verify FormData has the right entries
      expect(formData.get("title")).toBe("New Document")
      expect(formData.get("description")).toBe("New description")
      expect(formData.get("tags")).toBe(JSON.stringify(["new", "test"]))
      expect(formData.get("file")).toBe(file)

      // Verify auth token was included
      expect(config.headers.Authorization).toBe("Bearer test-token")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when creating a document", async () => {
      // Mock API error response
      const errorMessage = "Failed to create document"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(axios.post as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Create document data
      const file = new File(["test content"], "test.pdf", { type: "application/pdf" })
      const documentData = {
        title: "New Document",
        file,
        userId: "user1",
      }

      // Call createDocument function and expect it to throw
      await expect(documentService.createDocument(documentData)).rejects.toThrow(errorMessage)
    })
  })

  describe("updateDocument", () => {
    it("should update document metadata", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "1",
            title: "Updated Title",
            description: "Updated description",
            tags: ["updated", "document"],
            filePath: "/test/path.pdf",
            fileType: "application/pdf",
            fileSize: 1024,
            createdBy: "user1",
            isDeleted: false,
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-02T00:00:00.000Z",
          },
        },
      }
      ;(api.put as jest.Mock).mockResolvedValue(mockResponse)

      // Update data
      const updateData = {
        title: "Updated Title",
        description: "Updated description",
        tags: ["updated", "document"],
      }

      // Call updateDocument function
      const result = await documentService.updateDocument("1", updateData, "user1")

      // Verify API was called correctly
      expect(api.put).toHaveBeenCalledWith("/api/documents/1", updateData)

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when updating a document", async () => {
      // Mock API error response
      const errorMessage = "Failed to update document"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.put as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Update data
      const updateData = {
        title: "Updated Title",
      }

      // Call updateDocument function and expect it to throw
      await expect(documentService.updateDocument("1", updateData, "user1")).rejects.toThrow(errorMessage)
    })
  })

  describe("deleteDocument", () => {
    it("should delete a document", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          success: true,
          message: "Document deleted successfully",
        },
      }
      ;(api.delete as jest.Mock).mockResolvedValue(mockResponse)

      // Call deleteDocument function
      const result = await documentService.deleteDocument("1", "user1")

      // Verify API was called correctly
      expect(api.delete).toHaveBeenCalledWith("/api/documents/1")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data)
    })

    it("should handle errors when deleting a document", async () => {
      // Mock API error response
      const errorMessage = "Failed to delete document"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.delete as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Call deleteDocument function and expect it to throw
      await expect(documentService.deleteDocument("1", "user1")).rejects.toThrow(errorMessage)
    })
  })

  describe("uploadNewVersion", () => {
    it("should upload a new document version", async () => {
      // Mock token
      localStorageMock.setItem("auth_token", "test-token")

      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "v2",
            documentId: "1",
            versionNumber: 2,
            filePath: "/uploads/doc-v2.pdf",
            createdBy: "user1",
            changeSummary: "Updated content",
            createdAt: "2023-01-02T00:00:00.000Z",
          },
        },
      }
      ;(axios.post as jest.Mock).mockResolvedValue(mockResponse)

      // New version data
      const file = new File(["updated content"], "test-v2.pdf", { type: "application/pdf" })
      const versionData = {
        file,
        changeSummary: "Updated content",
        userId: "user1",
      }

      // Call uploadNewVersion function
      const result = await documentService.uploadNewVersion("1", versionData)

      // Verify axios.post was called with FormData
      expect(axios.post).toHaveBeenCalled()

      // Get the FormData from the axios.post call
      const axiosPostCall = (axios.post as jest.Mock).mock.calls[0]
      const url = axiosPostCall[0]
      const formData = axiosPostCall[1]
      const config = axiosPostCall[2]

      // Verify URL
      expect(url).toContain("/api/documents/1/versions")

      // Verify FormData has the right entries
      expect(formData.get("changeSummary")).toBe("Updated content")
      expect(formData.get("file")).toBe(file)

      // Verify auth token was included
      expect(config.headers.Authorization).toBe("Bearer test-token")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when uploading a new version", async () => {
      // Mock API error response
      const errorMessage = "Failed to upload new version"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(axios.post as jest.Mock).mockRejectedValue(mockErrorResponse)

      // New version data
      const file = new File(["updated content"], "test-v2.pdf", { type: "application/pdf" })
      const versionData = {
        file,
        userId: "user1",
      }

      // Call uploadNewVersion function and expect it to throw
      await expect(documentService.uploadNewVersion("1", versionData)).rejects.toThrow(errorMessage)
    })
  })

  describe("getDocumentVersions", () => {
    it("should fetch document versions", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: [
            {
              _id: "v1",
              documentId: "1",
              versionNumber: 1,
              filePath: "/uploads/doc-v1.pdf",
              createdBy: "user1",
              changeSummary: "Initial version",
              createdAt: "2023-01-01T00:00:00.000Z",
            },
            {
              _id: "v2",
              documentId: "1",
              versionNumber: 2,
              filePath: "/uploads/doc-v2.pdf",
              createdBy: "user1",
              changeSummary: "Updated content",
              createdAt: "2023-01-02T00:00:00.000Z",
            },
          ],
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      // Call getDocumentVersions function
      const result = await documentService.getDocumentVersions("1")

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith("/api/documents/1/versions")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when fetching document versions", async () => {
      // Mock API error response
      const errorMessage = "Failed to fetch document versions"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.get as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Call getDocumentVersions function and expect it to throw
      await expect(documentService.getDocumentVersions("1")).rejects.toThrow(errorMessage)
    })
  })

  describe("getDocumentPermissions", () => {
    it("should fetch document permissions", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: [
            {
              _id: "p1",
              documentId: "1",
              userId: "user2",
              permissionType: "read",
              createdAt: "2023-01-01T00:00:00.000Z",
            },
            {
              _id: "p2",
              documentId: "1",
              userId: "user3",
              permissionType: "write",
              createdAt: "2023-01-01T00:00:00.000Z",
            },
          ],
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      // Call getDocumentPermissions function
      const result = await documentService.getDocumentPermissions("1")

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith("/api/documents/1/permissions")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle errors when fetching document permissions", async () => {
      // Mock API error response
      const errorMessage = "Failed to fetch document permissions"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.get as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Call getDocumentPermissions function and expect it to throw
      await expect(documentService.getDocumentPermissions("1")).rejects.toThrow(errorMessage)
    })
  })

  describe("downloadDocument", () => {
    it("should download a document", async () => {
      // Mock API response with blob data
      const mockBlob = new Blob(["PDF content"], { type: "application/pdf" })
      const mockResponse = {
        data: mockBlob,
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      // Call downloadDocument function
      const result = await documentService.downloadDocument("1")

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith("/api/documents/1/download", {
        responseType: "blob",
      })

      // Verify correct data was returned
      expect(result).toBe(mockBlob)
    })

    it("should handle errors when downloading a document", async () => {
      // Mock API error
      const mockError = new Error("Download failed")
      ;(api.get as jest.Mock).mockRejectedValue(mockError)

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()

      // Call downloadDocument function and expect it to throw
      await expect(documentService.downloadDocument("1")).rejects.toThrow("Download failed")

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled()

      // Restore console.error
      consoleErrorSpy.mockRestore()
    })
  })
})
