// Real authentication service that makes API calls
import type { User } from "@/providers/auth-provider";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
console.log(
  "🚀 ~ process.env.NEXT_PUBLIC_API_URL:",
  process.env.NEXT_PUBLIC_API_URL
);
const TOKEN_KEY = "auth_token";

// Mock user database
const mockUsers = [
  {
    _id: "1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    password: "Password123!",
    fullName: "Admin User",
  },
  {
    _id: "2",
    email: "editor@example.com",
    firstName: "Editor",
    lastName: "User",
    role: "editor",
    password: "Password123!",
    fullName: "Editor User",
  },
  {
    _id: "3",
    email: "viewer@example.com",
    firstName: "Viewer",
    lastName: "User",
    role: "viewer",
    password: "Password123!",
    fullName: "Viewer User",
  },
];

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to get user without password
const sanitizeUser = (user: any): User => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const authService = {
  // Register a new user
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }) {
    try {
      const response = await api.post("/api/auth/register", userData);

      // Store token in localStorage
      if (response.data.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.data.token);
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Registration failed");
      }
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string) {
    try {
      const response = await api.post("/api/auth/login", { email, password });

      // Store token in localStorage
      if (response.data.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.data.token);
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Invalid credentials");
      }
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get("/api/auth/me");
      return response.data.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
      throw error;
    }
  },

  // Update user profile
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    password?: string;
  }) {
    try {
      const response = await api.put("/api/auth/me", data);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to update profile"
        );
      }
      throw error;
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
