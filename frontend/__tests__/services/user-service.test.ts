/**
 * @jest-environment jsdom
 *
 * Unit tests for services/user-service.ts
 */

import type { Mock } from "jest-mock";

/* ──────────────────────────────────────────────────────────────
   1.  Mock axios with a factory
       – The factory is evaluated before userService is imported.
       – We create the fake instance *inside* the factory and
         expose it via a private `_instance` property so tests
         can access it later.
   ──────────────────────────────────────────────────────────── */
jest.mock("axios", () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() } },
  };

  const axiosMock = {
    create: jest.fn(() => instance),
    defaults: { headers: { common: {} } },
    /* expose for test assertions */
    _instance: instance,
  };

  return {
    __esModule: true,
    default: axiosMock,
  };
});

/* ──────────────────────────────────────────────────────────────
   2.  Import axios (mocked) and userService
   ──────────────────────────────────────────────────────────── */
import axios from "axios";
import { userService } from "@/services/user-service";

/*  axiosMock typed handle  */
const axiosMocked = axios as unknown as {
  create: Mock;
  defaults: { headers: { common: Record<string, unknown> } };
  _instance: {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
  };
};

/*  Our fake API instance  */
const mockApiInstance = axiosMocked._instance;

/* ──────────────────────────────────────────────────────────────
   3.  Stub localStorage so getToken() works
   ──────────────────────────────────────────────────────────── */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((k: string) => store[k] ?? null),
    setItem: jest.fn((k: string, v: string) => {
      store[k] = v;
    }),
    removeItem: jest.fn((k: string) => {
      delete store[k];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

/* ──────────────────────────────────────────────────────────────
   4.  Tests
   ──────────────────────────────────────────────────────────── */
describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem("auth_token", "test-token");
  });

  /* ——— getUsers ——— */
  describe("getUsers", () => {
    it("fetches users with filters", async () => {
      const apiResponse = {
        data: {
          data: {
            users: [{ _id: "1", email: "admin@example.com" }],
            pagination: { page: 1, limit: 10, total: 1, pages: 1 },
          },
        },
      };
      mockApiInstance.get.mockResolvedValue(apiResponse);

      const params = { page: 1, role: "admin", isActive: true };
      const result = await userService.getUsers(params);

      expect(mockApiInstance.get).toHaveBeenCalledWith("/api/users", {
        params,
      });
      expect(result).toEqual(apiResponse.data.data);
    });

    it("propagates API errors", async () => {
      mockApiInstance.get.mockRejectedValue({
        response: { data: { message: "Failed to fetch users" } },
      });
      await expect(userService.getUsers({})).rejects.toThrow(
        "Failed to fetch users"
      );
    });
  });

  /* ——— getUserById ——— */
  describe("getUserById", () => {
    it("fetches a single user", async () => {
      mockApiInstance.get.mockResolvedValue({ data: { data: { _id: "1" } } });

      const result = await userService.getUserById("1");
      expect(mockApiInstance.get).toHaveBeenCalledWith("/api/users/1");
      expect(result).toEqual({ _id: "1" });
    });

    it("propagates API errors", async () => {
      mockApiInstance.get.mockRejectedValue({
        response: { data: { message: "User not found" } },
      });
      await expect(userService.getUserById("999")).rejects.toThrow(
        "User not found"
      );
    });
  });

  /* ——— createUser ——— */
  describe("createUser", () => {
    it("creates a user", async () => {
      mockApiInstance.post.mockResolvedValue({
        data: { data: { _id: "new" } },
      });

      const payload = { email: "new@example.com", password: "Password123!" };
      const result = await userService.createUser(payload as any);

      expect(mockApiInstance.post).toHaveBeenCalledWith("/api/users", payload);
      expect(result).toEqual({ _id: "new" });
    });

    it("propagates API errors", async () => {
      mockApiInstance.post.mockRejectedValue({
        response: { data: { message: "Email already in use" } },
      });
      await expect(
        userService.createUser({ email: "dup@example.com", password: "x" })
      ).rejects.toThrow("Email already in use");
    });
  });

  /* ——— updateUser ——— */
  describe("updateUser", () => {
    it("updates a user", async () => {
      mockApiInstance.put.mockResolvedValue({
        data: { data: { firstName: "Updated" } },
      });

      const result = await userService.updateUser("1", {
        firstName: "Updated",
      });
      expect(mockApiInstance.put).toHaveBeenCalledWith("/api/users/1", {
        firstName: "Updated",
      });
      expect(result).toEqual({ firstName: "Updated" });
    });

    it("propagates API errors", async () => {
      mockApiInstance.put.mockRejectedValue({
        response: { data: { message: "Failed to update user" } },
      });
      await expect(
        userService.updateUser("1", { role: "invalid" } as any)
      ).rejects.toThrow("Failed to update user");
    });
  });

  /* ——— deleteUser ——— */
  describe("deleteUser", () => {
    it("deletes a user", async () => {
      mockApiInstance.delete.mockResolvedValue({ data: { success: true } });

      const result = await userService.deleteUser("1");
      expect(mockApiInstance.delete).toHaveBeenCalledWith("/api/users/1");
      expect(result).toEqual({ success: true });
    });

    it("propagates API errors", async () => {
      mockApiInstance.delete.mockRejectedValue({
        response: { data: { message: "Failed to delete user" } },
      });
      await expect(userService.deleteUser("1")).rejects.toThrow(
        "Failed to delete user"
      );
    });
  });
});
