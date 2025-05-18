import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPage from "@/app/admin/page";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/services/user-service";
import { documentService } from "@/services/document-service";
import { ingestionService } from "@/services/ingestion-service";

// ─── mocks ────────────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("@/services/user-service", () => ({
  userService: { getUsers: jest.fn() },
}));
jest.mock("@/services/document-service", () => ({
  documentService: { getDocuments: jest.fn() },
}));
jest.mock("@/services/ingestion-service", () => ({
  ingestionService: { getIngestionJobs: jest.fn() },
}));
jest.mock("@/components/admin/user-table", () => ({
  __esModule: true,
  default: () => <div data-testid="user-table">User Table</div>,
}));
jest.mock("@/components/admin/document-table", () => ({
  __esModule: true,
  default: () => <div data-testid="document-table">Document Table</div>,
}));
jest.mock("@/components/admin/ingestion-table", () => ({
  __esModule: true,
  default: () => <div data-testid="ingestion-table">Ingestion Table</div>,
}));

// ─── helpers ──────────────────────────────────────────────────────────────────
const mockPush = jest.fn();
const mockToast = jest.fn();
const mockSearchParams = new URLSearchParams();
const mockSuccess = { pagination: { total: 10 }, data: [] };

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: mockPush,
  });
  (useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => mockSearchParams.get(key),
    toString: () => mockSearchParams.toString(),
  });
  (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

  userService.getUsers.mockResolvedValue(mockSuccess);
  documentService.getDocuments.mockResolvedValue(mockSuccess);
  ingestionService.getIngestionJobs.mockResolvedValue(mockSuccess);
});

// ─── tests ────────────────────────────────────────────────────────────────────
describe("AdminPage", () => {
  test("redirects non-admin users with toast", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "u1", role: "user" },
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      );
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("renders loading skeletons", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "a1", role: "admin" },
    });

    // keep promises pending
    userService.getUsers.mockReturnValue(new Promise(() => {}));
    documentService.getDocuments.mockReturnValue(new Promise(() => {}));
    ingestionService.getIngestionJobs.mockReturnValue(new Promise(() => {}));

    render(<AdminPage />);

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons).toHaveLength(6); // 2 skeletons × 3 cards
  });

  test("shows admin stats & user table", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "a1", role: "admin" },
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Total Users")).toBeInTheDocument();
      expect(screen.getAllByText("10")).toHaveLength(3);
      expect(screen.getByTestId("user-table")).toBeInTheDocument();
    });
  });

  test("documents tab click updates url & shows table", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "a1", role: "admin" },
    });

    render(<AdminPage />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /documents/i }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("tab=documents")
    );

    mockSearchParams.set("tab", "documents");
    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByTestId("document-table")).toBeInTheDocument()
    );
  });

  test("ingestion tab click updates url & shows table", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "a1", role: "admin" },
    });

    render(<AdminPage />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /ingestion/i }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("tab=ingestion")
    );

    mockSearchParams.set("tab", "ingestion");
    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByTestId("ingestion-table")).toBeInTheDocument()
    );
  });

  test("handleTabChange keeps existing params", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "a1", role: "admin" },
    });

    mockSearchParams.set("page", "2");

    render(<AdminPage />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /documents/i }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/page=2.*tab=documents|tab=documents.*page=2/)
    );
  });
});
