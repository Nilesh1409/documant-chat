// __tests__/components/admin/edit-user-dialog.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditUserDialog from "@/components/admin/edit-user-dialog";
import { userService } from "@/services/user-service";
import { useToast } from "@/components/ui/use-toast";

jest.mock("@/services/user-service");
jest.mock("@/components/ui/use-toast");

describe("EditUserDialog component", () => {
  const mockUser = {
    _id: "1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "editor",
    isActive: true,
  };

  const mockToast = { toast: jest.fn() };
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.updateUser as jest.Mock).mockResolvedValue({
      ...mockUser,
      firstName: "Updated",
      lastName: "Name",
      role: "admin",
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it("renders edit dialog when open", () => {
    render(
      <EditUserDialog
        user={mockUser}
        open={true}
        onOpenChange={jest.fn()}
        onSuccess={mockOnSuccess}
      />
    );

    // Title
    expect(
      screen.getByRole("heading", { name: "Edit User" })
    ).toBeInTheDocument();

    // Email displayed (read-only)
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();

    // First/Last Name inputs
    expect(screen.getByRole("textbox", { name: /first name/i })).toHaveValue(
      mockUser.firstName
    );
    expect(screen.getByRole("textbox", { name: /last name/i })).toHaveValue(
      mockUser.lastName
    );

    // Role combobox shows current role
    const roleCombobox = screen.getByRole("combobox", { name: /role/i });
    expect(roleCombobox).toHaveTextContent(/editor/i);

    // Buttons
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <EditUserDialog
        user={mockUser}
        open={false}
        onOpenChange={jest.fn()}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.queryByRole("heading", { name: "Edit User" })).toBeNull();
  });

  it("updates user successfully", async () => {
    const mockOnOpenChange = jest.fn();

    render(
      <EditUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Change first & last name
    fireEvent.change(screen.getByRole("textbox", { name: /first name/i }), {
      target: { value: "Updated" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Name" },
    });

    // Open role dropdown and select Admin
    fireEvent.click(screen.getByRole("combobox", { name: /role/i }));
    fireEvent.click(screen.getByRole("option", { name: "Admin" }));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith("1", {
        firstName: "Updated",
        lastName: "Name",
        role: "admin",
        isActive: true,
        password: undefined,
      });
    });

    expect(mockToast.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "User updated" })
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("handles update error", async () => {
    const errorMsg = "Failed to update";
    (userService.updateUser as jest.Mock).mockRejectedValueOnce(
      new Error(errorMsg)
    );

    render(
      <EditUserDialog
        user={mockUser}
        open={true}
        onOpenChange={jest.fn()}
        onSuccess={mockOnSuccess}
      />
    );

    // Submit without changes
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: errorMsg,
        })
      );
    });

    // Dialog still open
    expect(
      screen.getByRole("heading", { name: "Edit User" })
    ).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("closes dialog when cancel clicked", () => {
    const mockOnOpenChange = jest.fn();
    render(
      <EditUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
