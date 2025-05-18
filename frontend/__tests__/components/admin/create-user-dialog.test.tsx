// __tests__/components/admin/create-user-dialog.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateUserDialog from "@/components/admin/create-user-dialog";
import { userService } from "@/services/user-service";
import { useToast } from "@/components/ui/use-toast";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});
// Mock dependencies
jest.mock("@/services/user-service");
jest.mock("@/components/ui/use-toast");

describe("CreateUserDialog component", () => {
  const mockToast = { toast: jest.fn() };
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // createUser resolves to a fake user
    (userService.createUser as jest.Mock).mockResolvedValue({
      _id: "new-user",
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it("renders dialog when open", () => {
    render(
      <CreateUserDialog
        open
        onOpenChange={jest.fn()}
        onSuccess={mockOnSuccess}
      />
    );

    // Title
    expect(
      screen.getByRole("heading", { name: "Create User" })
    ).toBeInTheDocument();

    // Form fields
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeInTheDocument();

    // Buttons
    expect(
      screen.getByRole("button", { name: "Create User" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("does not render dialog when closed", () => {
    render(
      <CreateUserDialog
        open={false}
        onOpenChange={jest.fn()}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.queryByRole("heading", { name: "Create User" })).toBeNull();
  });

  it("validates form fields", async () => {
    render(
      <CreateUserDialog
        open
        onOpenChange={jest.fn()}
        onSuccess={mockOnSuccess}
      />
    );

    // Submit with empty fields
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));
    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Password must be at least 8 characters")
      ).toBeInTheDocument();
    });

    // Invalid email
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));
    await waitFor(() =>
      expect(
        screen.getByText("Please enter a valid email address")
      ).toBeInTheDocument()
    );

    // Short password
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));
    await waitFor(() =>
      expect(
        screen.getByText("Password must be at least 8 characters")
      ).toBeInTheDocument()
    );
  });

  it("creates user successfully", async () => {
    const mockOnOpenChange = jest.fn();

    render(
      <CreateUserDialog
        open
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill fields
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });

    // Open combobox and pick Editor
    fireEvent.click(screen.getByLabelText("Role"));
    fireEvent.click(screen.getByRole("option", { name: "Editor" }));

    fireEvent.click(screen.getByRole("button", { name: "Create User" }));

    await waitFor(() =>
      expect(userService.createUser).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "editor",
      })
    );

    expect(mockToast.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "User created" })
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("handles creation error", async () => {
    (userService.createUser as jest.Mock).mockRejectedValueOnce(
      new Error("Email exists")
    );

    render(
      <CreateUserDialog
        open
        onOpenChange={jest.fn()}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill only required to reach the network call
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "exists@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByLabelText("Role"));
    fireEvent.click(screen.getByRole("option", { name: "Viewer" }));

    fireEvent.click(screen.getByRole("button", { name: "Create User" }));

    await waitFor(() =>
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "Email exists",
        })
      )
    );

    // Dialog stays open
    expect(
      screen.getByRole("heading", { name: "Create User" })
    ).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("closes dialog when cancel is clicked", () => {
    const mockOnOpenChange = jest.fn();
    render(
      <CreateUserDialog
        open
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
