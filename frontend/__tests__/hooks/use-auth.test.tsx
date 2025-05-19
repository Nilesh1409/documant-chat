"use client"

import { renderHook, act } from "@testing-library/react"
import { useAuth } from "@/hooks/use-auth"
import { AuthContext } from "@/providers/auth-provider"
import type { ReactNode } from "react"
import jest from "jest" // Import jest to declare the variable

// Mock AuthContext values
const mockAuthContext = {
  user: {
    _id: "test-user-id",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "admin",
    fullName: "Test User",
  },
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateProfile: jest.fn(),
  isLoading: false,
  error: null,
}

// Wrapper component with mocked AuthContext
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={mockAuthContext}>{children}</AuthContext.Provider>
)

describe("useAuth hook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return auth context values", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toEqual(mockAuthContext)
    expect(result.current.user).toEqual(mockAuthContext.user)
    expect(typeof result.current.login).toBe("function")
    expect(typeof result.current.logout).toBe("function")
    expect(typeof result.current.register).toBe("function")
    expect(typeof result.current.updateProfile).toBe("function")
  })

  it("should call login function with correct parameters", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login("test@example.com", "password123")
    })

    expect(mockAuthContext.login).toHaveBeenCalledWith("test@example.com", "password123")
  })

  it("should call logout function", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(mockAuthContext.logout).toHaveBeenCalled()
  })

  it("should call register function with correct parameters", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    const userData = {
      email: "new@example.com",
      password: "password123",
      firstName: "New",
      lastName: "User",
    }

    act(() => {
      result.current.register(userData)
    })

    expect(mockAuthContext.register).toHaveBeenCalledWith(userData)
  })

  it("should call updateProfile function with correct parameters", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    const profileData = {
      firstName: "Updated",
      lastName: "User",
    }

    act(() => {
      result.current.updateProfile(profileData)
    })

    expect(mockAuthContext.updateProfile).toHaveBeenCalledWith(profileData)
  })

  it("should throw error when used outside AuthProvider", () => {
    // Spy on console.error to suppress the expected error in test output
    jest.spyOn(console, "error").mockImplementation(() => {})

    // Using renderHook without the wrapper should throw an error
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow("useAuth must be used within an AuthProvider")

    // Restore console.error
    jest.restoreAllMocks()
  })
})
