import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/providers/auth-provider";
import { authService } from "@/services/auth-service";

// Mock auth service
jest.mock("@/services/auth-service", () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

describe("useAuth Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  test("provides initial auth state", async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initial state should have loading true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();

    // Wait for getCurrentUser to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // After loading, state should be updated
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test("loads user on mount if token exists", async () => {
    const mockUser = {
      _id: "user-1",
      email: "test@example.com",
      role: "viewer",
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initial state should have loading true
    expect(result.current.isLoading).toBe(true);

    // Wait for getCurrentUser to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // After loading, state should be updated with user
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  test("login updates auth state with user", async () => {
    const mockUser = {
      _id: "user-1",
      email: "test@example.com",
      role: "viewer",
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (authService.login as jest.Mock).mockResolvedValue({
      user: mockUser,
      token: "mock-token",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial getCurrentUser to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Initial state should have no user
    expect(result.current.user).toBeNull();

    // Call login
    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    // Auth state should be updated with user
    expect(result.current.user).toEqual(mockUser);
    expect(authService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
  });

  test("register updates auth state with user", async () => {
    const mockUser = {
      _id: "user-1",
      email: "new@example.com",
      firstName: "New",
      lastName: "User",
      role: "viewer",
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (authService.register as jest.Mock).mockResolvedValue({
      user: mockUser,
      token: "mock-token",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial getCurrentUser to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Initial state should have no user
    expect(result.current.user).toBeNull();

    // Call register
    await act(async () => {
      await result.current.register({
        email: "new@example.com",
        password: "password123",
        firstName: "New",
        lastName: "User",
      });
    });

    // Auth state should be updated with user
    expect(result.current.user).toEqual(mockUser);
    expect(authService.register).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
      firstName: "New",
      lastName: "User",
    });
  });

  test("logout clears auth state", async () => {
    const mockUser = {
      _id: "user-1",
      email: "test@example.com",
      role: "viewer",
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for getCurrentUser to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Initial state should have user
    expect(result.current.user).toEqual(mockUser);

    // Call logout
    act(() => {
      result.current.logout();
    });

    // Auth state should be cleared
    expect(result.current.user).toBeNull();
    expect(authService.logout).toHaveBeenCalled();
  });

  test("handles login errors", async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (authService.login as jest.Mock).mockRejectedValue(
      new Error("Invalid credentials")
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial getCurrentUser to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Call login and expect it to throw
    await expect(
      act(async () => {
        await result.current.login("test@example.com", "wrong-password");
      })
    ).rejects.toThrow("Invalid credentials");

    // Auth state should still have no user
    expect(result.current.user).toBeNull();
  });

  test("handles register errors", async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    (authService.register as jest.Mock).mockRejectedValue(
      new Error("User already exists")
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial getCurrentUser to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Call register and expect it to throw
    await expect(
      act(async () => {
        await result.current.register({
          email: "existing@example.com",
          password: "password123",
          firstName: "Existing",
          lastName: "User",
        });
      })
    ).rejects.toThrow("User already exists");

    // Auth state should still have no user
    expect(result.current.user).toBeNull();
  });
});
