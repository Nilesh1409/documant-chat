import { jest } from "@jest/globals";
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AuthProvider,
  AuthContext,
  type User,
} from "@/providers/auth-provider";

// ------------------------------------------------------------------
// 1) shared mocks
// ------------------------------------------------------------------
const apiMock = (global as any).axiosMock;

// auth-service stub
jest.mock("@/services/auth-service", () => ({
  __esModule: true,
  authService: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
  },
}));
const mockAuthService = require("@/services/auth-service")
  .authService as jest.Mocked<
  typeof import("@/services/auth-service")["authService"]
>;

// toast stub
const toastMock = { toast: jest.fn() };
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => toastMock,
}));

// next/navigation stub
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/test-path",
}));

// ------------------------------------------------------------------
// 2) helper consumer component
// ------------------------------------------------------------------
const TestConsumer = () => {
  const { user, isLoading, login, register, logout, updateProfile } =
    React.useContext(AuthContext)!;

  return (
    <div>
      <div data-testid="loading">{isLoading ? "Loading" : "Not Loading"}</div>
      <div data-testid="user">
        {user ? `${user.email} (${user.role})` : "No user"}
      </div>
      <button
        data-testid="login"
        onClick={() => login("test@example.com", "pw")}
      >
        Login
      </button>
      <button
        data-testid="register"
        onClick={() => register({ email: "new@example.com", password: "pw" })}
      >
        Register
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
      <button
        data-testid="update"
        onClick={() => updateProfile({ firstName: "Updated" })}
      >
        Update
      </button>
    </div>
  );
};

// ------------------------------------------------------------------
// 3) test-bed helper
// ------------------------------------------------------------------
async function renderProvider() {
  await act(async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
  });
}

// ------------------------------------------------------------------
// 4) TESTS
// ------------------------------------------------------------------
describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initialises with no user", async () => {
    mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error("Unauth"));
    await renderProvider();

    expect(screen.getByTestId("loading").textContent).toBe("Loading");
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    );
    expect(screen.getByTestId("user").textContent).toBe("No user");
  });

  it("shows existing user on mount", async () => {
    const user: User = { _id: "1", email: "a@b.com", role: "viewer" };
    mockAuthService.getCurrentUser.mockResolvedValueOnce(user);

    await renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("a@b.com (viewer)")
    );
  });

  it("handles successful login", async () => {
    const ui = userEvent.setup();
    const user: User = { _id: "2", email: "x@y.com", role: "editor" };
    mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error("Unauth"));
    mockAuthService.login.mockResolvedValueOnce({ user });
    apiMock.post.mockResolvedValueOnce({
      data: { data: { user, token: "tok" } },
    });

    await renderProvider();
    await act(async () => ui.click(screen.getByTestId("login")));

    expect(apiMock.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "test@example.com",
      password: "pw",
    });
    expect(screen.getByTestId("user").textContent).toBe("x@y.com (editor)");
    expect(toastMock.toast).toHaveBeenCalled();
  });

  it("propagates login error", async () => {
    const ui = userEvent.setup();
    mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error("Unauth"));
    mockAuthService.login.mockRejectedValueOnce(new Error("Bad creds"));

    await renderProvider();
    await expect(
      act(async () => ui.click(screen.getByTestId("login")))
    ).rejects.toThrow("Bad creds");

    expect(toastMock.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" })
    );
  });

  it("handles registration success", async () => {
    const ui = userEvent.setup();
    const user: User = { _id: "3", email: "new@example.com", role: "viewer" };
    mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error("Unauth"));
    mockAuthService.register.mockResolvedValueOnce({ user });
    apiMock.post.mockResolvedValueOnce({
      data: { data: { user, token: "tok" } },
    });

    await renderProvider();
    await act(async () => ui.click(screen.getByTestId("register")));

    expect(apiMock.post).toHaveBeenCalledWith("/api/auth/register", {
      email: "new@example.com",
      password: "pw",
    });
    expect(screen.getByTestId("user").textContent).toBe(
      "new@example.com (viewer)"
    );
  });

  it("propagates registration error", async () => {
    const ui = userEvent.setup();
    mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error("Unauth"));
    mockAuthService.register.mockRejectedValueOnce(new Error("Email exists"));

    await renderProvider();
    await expect(
      act(async () => ui.click(screen.getByTestId("register")))
    ).rejects.toThrow("Email exists");

    expect(toastMock.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" })
    );
  });

  it("handles logout", async () => {
    const ui = userEvent.setup();
    const user: User = { _id: "4", email: "out@t.com", role: "editor" };
    mockAuthService.getCurrentUser.mockResolvedValueOnce(user);

    await renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("out@t.com (editor)")
    );

    await act(async () => ui.click(screen.getByTestId("logout")));

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(screen.getByTestId("user").textContent).toBe("No user");
  });

  it("handles profile update success", async () => {
    const ui = userEvent.setup();
    const orig: User = { _id: "5", email: "orig@y.com", role: "editor" };
    const updated: User = { ...orig, firstName: "Updated" };
    mockAuthService.getCurrentUser.mockResolvedValueOnce(orig);
    mockAuthService.updateProfile.mockResolvedValueOnce(updated);
    apiMock.put.mockResolvedValueOnce({ data: { data: updated } });

    await renderProvider();
    await act(async () => ui.click(screen.getByTestId("update")));

    expect(apiMock.put).toHaveBeenCalledWith("/api/auth/me", {
      firstName: "Updated",
    });
  });

  it("propagates profile update error", async () => {
    const ui = userEvent.setup();
    const user: User = { _id: "6", email: "err@y.com", role: "editor" };
    mockAuthService.getCurrentUser.mockResolvedValueOnce(user);
    mockAuthService.updateProfile.mockRejectedValueOnce(new Error("Upd fail"));

    await renderProvider();
    await expect(
      act(async () => ui.click(screen.getByTestId("update")))
    ).rejects.toThrow("Upd fail");

    expect(toastMock.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" })
    );
  });
});
