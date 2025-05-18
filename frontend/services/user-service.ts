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

// Mock user database - this would normally come from the API
const mockUsers = [
  {
    _id: "1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    fullName: "Admin User",
  },
  {
    _id: "2",
    email: "editor@example.com",
    firstName: "Editor",
    lastName: "User",
    role: "editor",
    isActive: true,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    fullName: "Editor User",
  },
  {
    _id: "3",
    email: "viewer@example.com",
    firstName: "Viewer",
    lastName: "User",
    role: "viewer",
    isActive: true,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    fullName: "Viewer User",
  },
];

// Generate more mock users for pagination testing
for (let i = 4; i <= 20; i++) {
  mockUsers.push({
    _id: String(i),
    email: `user${i}@example.com`,
    firstName: `User`,
    lastName: `${i}`,
    role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "editor" : "viewer",
    isActive: true,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    fullName: `User ${i}`,
  });
}

export const userService = {
  // Get all users with pagination and filters
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }) {
    try {
      const response = await api.get("/api/users", { params });
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch users");
      }
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string) {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch user");
      }
      throw error;
    }
  },

  // Create a new user
  async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }) {
    try {
      const response = await api.post("/api/users", userData);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to create user");
      }
      throw error;
    }
  },

  // Update user
  async updateUser(
    id: string,
    userData: {
      firstName?: string;
      lastName?: string;
      role?: string;
      isActive?: boolean;
      password?: string;
    }
  ) {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to update user");
      }
      throw error;
    }
  },

  // Delete user
  async deleteUser(id: string) {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to delete user");
      }
      throw error;
    }
  },
};
