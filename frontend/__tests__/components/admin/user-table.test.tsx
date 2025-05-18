// __tests__/components/admin/user-table.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserTable from "@/components/admin/user-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/services/user-service";

// ─── Stub out window.confirm so it always returns true ────────────────────────
beforeAll(() => {
  jest.spyOn(window, "confirm").mockImplementation(() => true);
});

// ─── Mocks for nested components we don’t test here ──────────────────────────
jest.mock("@/components/pagination", () => () => null);
jest.mock("@/components/admin/create-user-dialog", () => () => null);
jest.mock("@/components/admin/edit-user-dialog", () => () => null);

// ─── Next.js hooks & Toast & Service ─────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("@/services/user-service", () => ({
  userService: {
    getUsers: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

describe("UserTable", () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  let searchParams: URLSearchParams;

  beforeEach(() => {
    jest.clearAllMocks();
    searchParams = new URLSearchParams();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => searchParams.get(key),
      toString: () => searchParams.toString(),
    });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it("renders loading skeletons initially", () => {
    // Never resolve getUsers so isLoading stays true
    (userService.getUsers as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<UserTable />);

    // Look for skeleton by its pulse class
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("fetches and displays users", async () => {
    const mockUsers = [
      {
        _id: "u1",
        email: "a@x.com",
        fullName: "Alice",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "u2",
        email: "b@x.com",
        fullName: "",
        role: "viewer",
        isActive: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const mockPagination = { page: 1, limit: 10, total: 2, pages: 1 };
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: mockUsers,
      pagination: mockPagination,
    });

    render(<UserTable />);

    // wait for rows
    for (const u of mockUsers) {
      expect(await screen.findByText(u.email)).toBeInTheDocument();
      const name = u.fullName || "-";
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("clicking Search resets to page 1 and pushes router", async () => {
    (userService.getUsers as jest.Mock).mockResolvedValue({
      users: [],
      pagination: { page: 2, limit: 10, total: 0, pages: 1 },
    });

    render(<UserTable />);
    // wait for initial load
    await waitFor(() => expect(userService.getUsers).toHaveBeenCalled());

    // Type something and press Enter in the input
    const input = screen.getByPlaceholderText("Search users...");
    await userEvent.type(input, "foo{Enter}");

    expect(mockPush).toHaveBeenCalledWith("/admin?tab=users&page=1");
  });

  it("deletes a user: calls API, shows toast, and refetches", async () => {
    const mockUsers = [
      {
        _id: "u1",
        email: "a@x.com",
        fullName: "Alice",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    const mockPagination = { page: 1, limit: 10, total: 1, pages: 1 };

    // First fetch
    (userService.getUsers as jest.Mock).mockResolvedValueOnce({
      users: mockUsers,
      pagination: mockPagination,
    });
    // Second fetch (after deletion)
    (userService.getUsers as jest.Mock).mockResolvedValueOnce({
      users: [],
      pagination: { ...mockPagination, total: 0 },
    });
    (userService.deleteUser as jest.Mock).mockResolvedValueOnce(undefined);

    render(<UserTable />);

    // wait for initial row
    expect(await screen.findByText("a@x.com")).toBeInTheDocument();

    // click delete button
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    // confirm() is now stubbed to return true
    await waitFor(() =>
      expect(userService.deleteUser).toHaveBeenCalledWith("u1")
    );

    // toast shown
    expect(mockToast).toHaveBeenCalledWith({
      title: "User deleted",
      description: "The user has been deleted successfully.",
    });

    // refetch happened: the table is now empty
    await waitFor(() =>
      expect(screen.getByText("No users found")).toBeInTheDocument()
    );
  });
});
