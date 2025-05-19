import { authService } from "@/services/auth-service"
import { api } from "@/lib/api"
import { jest } from "@jest/globals"

// Mock the api module
jest.mock("@/lib/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}))

// Mock localStorage
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

describe("Auth Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe("register", () => {
    it("should register a new user and store token", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            user: {
              _id: "new-user-id",
              email: "newuser@example.com",
              firstName: "New",
              lastName: "User",
              role: "viewer",
            },
            token: "new-user-token",
          },
        },
      }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      // Registration data
      const userData = {
        email: "newuser@example.com",
        password: "Password123!",
        firstName: "New",
        lastName: "User",
      }

      // Call register function
      const result = await authService.register(userData)

      // Verify API was called correctly
      expect(api.post).toHaveBeenCalledWith("/api/auth/register", userData)

      // Verify token was stored
      expect(localStorageMock.setItem).toHaveBeenCalledWith("auth_token", "new-user-token")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle registration errors", async () => {
      // Mock API error response
      const errorMessage = "Email already in use"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.post as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Registration data
      const userData = {
        email: "existing@example.com",
        password: "Password123!",
      }

      // Call register function and expect it to throw
      await expect(authService.register(userData)).rejects.toThrow(errorMessage)

      // Verify token was not stored
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it("should handle generic errors during registration", async () => {
      // Mock generic error (network issue, etc.)
      ;(api.post as jest.Mock).mockRejectedValue(new Error("Network error"))

      // Registration data
      const userData = {
        email: "newuser@example.com",
        password: "Password123!",
      }

      // Call register function and expect it to throw
      await expect(authService.register(userData)).rejects.toThrow("Network error")
    })
  })

  describe("login", () => {
    it("should login a user and store token", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            user: {
              _id: "user-id",
              email: "user@example.com",
              firstName: "Test",
              lastName: "User",
              role: "editor",
            },
            token: "user-auth-token",
          },
        },
      }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      // Call login function
      const result = await authService.login("user@example.com", "Password123!")

      // Verify API was called correctly
      expect(api.post).toHaveBeenCalledWith("/api/auth/login", {
        email: "user@example.com",
        password: "Password123!",
      })

      // Verify token was stored
      expect(localStorageMock.setItem).toHaveBeenCalledWith("auth_token", "user-auth-token")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle login errors", async () => {
      // Mock API error response
      const errorMessage = "Invalid credentials"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.post as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Call login function and expect it to throw
      await expect(authService.login("wrong@example.com", "WrongPassword!")).rejects.toThrow(errorMessage)

      // Verify token was not stored
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe("getCurrentUser", () => {
    it("should fetch the current user", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "user-id",
            email: "user@example.com",
            firstName: "Test",
            lastName: "User",
            role: "editor",
          },
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      // Call getCurrentUser function
      const result = await authService.getCurrentUser()

      // Verify API was called correctly
      expect(api.get).toHaveBeenCalledWith("/api/auth/me")

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should remove token if auth fails with 401", async () => {
      // Mock API error response with 401 status
      const mockErrorResponse = {
        response: {
          status: 401,
          data: {
            message: "Unauthorized",
          },
        },
      }
      ;(api.get as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Set a fake token
      localStorageMock.setItem("auth_token", "invalid-token")

      // Call getCurrentUser function and expect it to throw
      await expect(authService.getCurrentUser()).rejects.toThrow()

      // Verify token was removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token")
    })

    it("should handle generic errors when fetching user", async () => {
      // Mock generic error
      ;(api.get as jest.Mock).mockRejectedValue(new Error("Server error"))

      // Call getCurrentUser function and expect it to throw
      await expect(authService.getCurrentUser()).rejects.toThrow("Server error")

      // Verify token was not removed
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })
  })

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      // Mock API response
      const mockResponse = {
        data: {
          data: {
            _id: "user-id",
            email: "user@example.com",
            firstName: "Updated",
            lastName: "User",
            role: "editor",
          },
        },
      }
      ;(api.put as jest.Mock).mockResolvedValue(mockResponse)

      // Profile update data
      const profileData = {
        firstName: "Updated",
        lastName: "User",
      }

      // Call updateProfile function
      const result = await authService.updateProfile(profileData)

      // Verify API was called correctly
      expect(api.put).toHaveBeenCalledWith("/api/auth/me", profileData)

      // Verify correct data was returned
      expect(result).toEqual(mockResponse.data.data)
    })

    it("should handle profile update errors", async () => {
      // Mock API error response
      const errorMessage = "Profile update failed"
      const mockErrorResponse = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }
      ;(api.put as jest.Mock).mockRejectedValue(mockErrorResponse)

      // Profile update data
      const profileData = {
        firstName: "Updated",
        password: "NewPassword123!",
      }

      // Call updateProfile function and expect it to throw
      await expect(authService.updateProfile(profileData)).rejects.toThrow(errorMessage)
    })
  })

  describe("logout", () => {
    it("should remove the auth token", () => {
      // Set a token
      localStorageMock.setItem("auth_token", "user-token")

      // Call logout function
      authService.logout()

      // Verify token was removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token")
    })
  })
})
