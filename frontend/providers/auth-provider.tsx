"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/services/auth-service"

export type User = {
  _id: string
  email: string
  firstName?: string
  lastName?: string
  role: "admin" | "editor" | "viewer"
  fullName?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: UpdateProfileData) => Promise<void>
}

type RegisterData = {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: string
}

type UpdateProfileData = {
  firstName?: string
  lastName?: string
  password?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        // Not logged in, that's okay
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { user: userData } = await authService.login(email, password)
      setUser(userData)

      toast({
        title: "Login successful",
        description: `Welcome back${userData.firstName ? `, ${userData.firstName}` : ""}!`,
      })

      // Redirect to documents page after login
      router.push("/documents")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      const { user: newUser } = await authService.register(userData)
      setUser(newUser)

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      })

      // Redirect to documents page after registration
      router.push("/documents")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Could not create account",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })

    // Redirect to home page after logout
    router.push("/")
  }

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true)
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update profile",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
