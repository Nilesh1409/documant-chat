/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DocumentPermissionsPage from "@/app/documents/[id]/permissions/page";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/document-service";
import { userService } from "@/services/user-service";

// Stub next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

// Stub lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="ICON-ARROW" />,
  Users: () => <span data-testid="ICON-USERS" />,
  Trash: () => <button data-testid="ICON-TRASH" />,
  UserPlus: () => <span data-testid="ICON-ADD" />,
  Loader2: () => <span data-testid="ICON-LOADER" />,
}));

// Stub UI components
jest.mock("@/components/ui/card", () => ({
  __esModule: true,
  Card: ({ children }) => <div data-testid="CARD">{children}</div>,
  CardHeader: ({ children }) => <header>{children}</header>,
  CardContent: ({ children }) => <section>{children}</section>,
  CardTitle: ({ children }) => <h2>{children}</h2>,
  CardDescription: ({ children }) => <p>{children}</p>,
}));
jest.mock("@/components/ui/select", () => ({
  __esModule: true,
  Select: ({
    children,
    value,
    onValueChange,
    "data-testid": tid = "SELECT",
  }) => (
    <select
      data-testid={tid}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: ({ placeholder }) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ value, children }) => (
    <option value={value}>{children}</option>
  ),
}));
jest.mock("@/components/ui/button", () => ({
  __esModule: true,
  Button: ({ children, asChild, ...props }) => (
    // strip out asChild
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/skeleton", () => ({
  __esModule: true,
  Skeleton: () => <div data-testid="SKELETON" className="animate-pulse" />,
}));

// Mock hooks & services
jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/services/document-service", () => ({
  documentService: {
    getDocumentById: jest.fn(),
    getDocumentPermissions: jest.fn(),
    addDocumentPermission: jest.fn(),
    removeDocumentPermission: jest.fn(),
  },
}));
jest.mock("@/services/user-service", () => ({
  userService: { getUsers: jest.fn() },
}));

describe("<DocumentPermissionsPage />", () => {
  const push = jest.fn();
  const toast = jest.fn();
  const params = { id: "doc1" };
  const owner = { _id: "u1", fullName: "Owner" };
  const otherUser = { _id: "u2", fullName: "User B", email: "b@example.com" };
  const perm = { _id: "p1", userId: otherUser, permissionType: "write" };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: owner });
    useToast.mockReturnValue({ toast });
    useRouter.mockReturnValue({ push });
  });

  it("renders loading skeletons", () => {
    documentService.getDocumentById.mockReturnValue(new Promise(() => {}));
    render(<DocumentPermissionsPage params={params} />);
    expect(screen.getAllByTestId("SKELETON").length).toBeGreaterThan(0);
  });

  it("fetch document error → toast + redirect", async () => {
    documentService.getDocumentById.mockRejectedValue(new Error("fail-doc"));
    render(<DocumentPermissionsPage params={params} />);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "fail-doc",
        })
      )
    );
    expect(push).toHaveBeenCalledWith("/documents");
  });

  it("document not found → shows not-found UI", async () => {
    documentService.getDocumentById.mockResolvedValue({ document: null });
    documentService.getDocumentPermissions.mockResolvedValue([]);
    userService.getUsers.mockResolvedValue({ users: [] });
    render(<DocumentPermissionsPage params={params} />);
    expect(await screen.findByText(/Document not found/i)).toBeInTheDocument();
  });

  it("access denied non-owner → shows access denied", async () => {
    useAuth.mockReturnValue({ user: { _id: "x" } });
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockResolvedValue([]);
    userService.getUsers.mockResolvedValue({ users: [] });
    render(<DocumentPermissionsPage params={params} />);
    expect(await screen.findByText(/Access Denied/i)).toBeInTheDocument();
  });

  it("owner with no extra perms → shows empty state", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner, title: "T" },
    });
    documentService.getDocumentPermissions.mockResolvedValue([]);
    userService.getUsers.mockResolvedValue({ users: [owner, otherUser] });
    render(<DocumentPermissionsPage params={params} />);
    expect(await screen.findByText(/Manage Permissions/i)).toBeInTheDocument();
    expect(screen.getByText(/No additional permissions/i)).toBeInTheDocument();
  });

  it("owner with existing permissions → lists them", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner, title: "T" },
    });
    documentService.getDocumentPermissions.mockResolvedValue([perm]);
    userService.getUsers.mockResolvedValue({ users: [owner, otherUser] });
    render(<DocumentPermissionsPage params={params} />);
    expect(await screen.findByText(otherUser.fullName)).toBeInTheDocument();
    // badge is a <span>, so pick that one
    const badges = screen.getAllByText(/^Write$/i);
    expect(badges.some((el) => el.tagName === "SPAN")).toBe(true);
  });

  it("fetch permissions error → toast only", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockRejectedValue(
      new Error("fail-perm")
    );
    userService.getUsers.mockResolvedValue({ users: [] });
    render(<DocumentPermissionsPage params={params} />);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "fail-perm",
        })
      )
    );
  });

  it("fetch users error → silent", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockResolvedValue([]);
    userService.getUsers.mockRejectedValue(new Error("fail-users"));
    render(<DocumentPermissionsPage params={params} />);
    await waitFor(() =>
      expect(toast).not.toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      )
    );
  });

  it("add-permission validation error", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockResolvedValue([]);
    userService.getUsers.mockResolvedValue({ users: [owner, otherUser] });
    render(<DocumentPermissionsPage params={params} />);
    await screen.findByText(/Manage Permissions/i);
    fireEvent.click(screen.getByRole("button", { name: /Add/i }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "Please select a user and permission type",
        })
      )
    );
  });

  it("add-permission success", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockResolvedValue([]);
    userService.getUsers.mockResolvedValue({ users: [owner, otherUser] });
    documentService.addDocumentPermission.mockResolvedValue({});
    render(<DocumentPermissionsPage params={params} />);
    await screen.findByText(/Manage Permissions/i);

    const [userSelect, permSelect] = screen.getAllByTestId("SELECT");
    fireEvent.change(userSelect, { target: { value: otherUser._id } });
    fireEvent.change(permSelect, { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: /Add/i }));

    await waitFor(() =>
      expect(documentService.addDocumentPermission).toHaveBeenCalledWith(
        "doc1",
        { userId: otherUser._id, permissionType: "admin" },
        owner._id
      )
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Permission added" })
    );
  });

  it("add-permission failure → toast", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockResolvedValue([]);
    userService.getUsers.mockResolvedValue({ users: [owner, otherUser] });
    documentService.addDocumentPermission.mockRejectedValue(
      new Error("fail-add")
    );
    render(<DocumentPermissionsPage params={params} />);
    await screen.findByText(/Manage Permissions/i);

    const [userSelect] = screen.getAllByTestId("SELECT");
    fireEvent.change(userSelect, { target: { value: otherUser._id } });
    fireEvent.click(screen.getByRole("button", { name: /Add/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "fail-add",
        })
      )
    );
  });

  it("remove-permission success", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockResolvedValue([perm]);
    userService.getUsers.mockResolvedValue({ users: [owner, otherUser] });
    documentService.removeDocumentPermission.mockResolvedValue({});
    render(<DocumentPermissionsPage params={params} />);
    await screen.findByText(otherUser.fullName);

    fireEvent.click(screen.getByTestId("ICON-TRASH"));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Permission removed" })
      )
    );
  });

  it("remove-permission failure → toast", async () => {
    documentService.getDocumentById.mockResolvedValue({
      document: { createdBy: owner },
    });
    documentService.getDocumentPermissions.mockResolvedValue([perm]);
    userService.getUsers.mockResolvedValue({ users: [owner, otherUser] });
    documentService.removeDocumentPermission.mockRejectedValue(
      new Error("fail-rem")
    );
    render(<DocumentPermissionsPage params={params} />);
    await screen.findByText(otherUser.fullName);

    fireEvent.click(screen.getByTestId("ICON-TRASH"));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "fail-rem",
        })
      )
    );
  });
});
