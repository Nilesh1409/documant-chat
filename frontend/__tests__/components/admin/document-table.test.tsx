/**
 * @jest-environment jsdom
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ----------------------------------------------------------------------------
// 1) Mock documentService BEFORE importing the component
// ----------------------------------------------------------------------------
jest.mock("@/services/document-service", () => ({
  documentService: {
    getDocuments: jest.fn().mockResolvedValue({
      documents: [
        {
          _id: "doc1",
          title: "My PDF",
          description: "A PDF doc",
          createdBy: { fullName: "Alice" },
          fileType: "application/pdf",
          fileSize: 2 * 1024 * 1024, // 2 MB
          updatedAt: "2025-01-01T00:00:00Z",
        },
        {
          _id: "doc2",
          title: "My Image",
          description: "",
          createdBy: "unknown-user-id",
          fileType: "image/png",
          fileSize: 512 * 1024, // 0.5 MB
          updatedAt: "2025-02-01T00:00:00Z",
        },
      ],
      pagination: { page: 1, limit: 10, total: 2, pages: 2 },
    }),
    deleteDocumentPermanently: jest.fn().mockResolvedValue(undefined),
  },
}));

// ----------------------------------------------------------------------------
// 2) Stub Next.js navigation hooks
// ----------------------------------------------------------------------------
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (k: string) => (k === "page" ? "1" : k === "search" ? "" : null),
    toString: () => "page=1",
  }),
}));

// ----------------------------------------------------------------------------
// 3) Stub toast, date-fns, file-icons, UI primitives & Pagination
// ----------------------------------------------------------------------------
const toastMock = jest.fn();
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "5 days ago"),
}));

jest.mock("@/lib/file-icons", () => ({
  getFileIcon: () => (p: any) => <span data-testid="file-icon" {...p} />,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: (p: any) => <input {...p} />,
}));
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: (p: any) => <div data-testid="skeleton" {...p} />,
}));
jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...p }: any) => <tr {...p}>{children}</tr>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

// ----------------------------------------------------------------------------
// 4) Stub Button so we swallow `asChild` before it hits the DOM
// ----------------------------------------------------------------------------
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/pagination", () => ({
  __esModule: true,
  default: ({ currentPage, totalPages }: any) => (
    <div data-testid="pagination">
      {currentPage}/{totalPages}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  __esModule: true,
  Eye: () => <span>👁️</span>,
  Search: () => <span>🔍</span>,
  Trash: () => <span>🗑️</span>,
}));

// ----------------------------------------------------------------------------
// 5) Now import the component under test
// ----------------------------------------------------------------------------
import DocumentTable from "@/components/admin/document-table";
import { documentService } from "@/services/document-service";

describe("<DocumentTable />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading skeletons on first render", () => {
    // NOTE: we deliberately do NOT wrap this one in `act(...)`:
    // we want to catch the very first UI snapshot, before our mock promise resolves.
    render(<DocumentTable />);
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons).toHaveLength(6);

    // we also fired off one fetch call right away
    expect(documentService.getDocuments).toHaveBeenCalledTimes(1);
    expect(documentService.getDocuments).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: "",
    });
  });

  it("renders one row per document after loading", async () => {
    // wrap in act so that the hook-triggered fetch and setState finish
    await act(async () => {
      render(<DocumentTable />);
    });
    // wait until skeletons disappear
    await waitFor(() => {
      expect(screen.queryByTestId("skeleton")).toBeNull();
    });

    // first document
    expect(screen.getByText("My PDF")).toBeVisible();
    expect(screen.getByText("A PDF doc")).toBeVisible();
    expect(screen.getByText("Alice")).toBeVisible();
    expect(screen.getByText("PDF")).toBeVisible();
    expect(screen.getByText("2.00 MB")).toBeVisible();

    // “5 days ago” shows up twice—once per row
    expect(screen.getAllByText("5 days ago")).toHaveLength(2);

    // second document
    expect(screen.getByText("My Image")).toBeVisible();
    expect(screen.getByText("No description")).toBeVisible();
    expect(screen.getByText("Unknown user")).toBeVisible();
    expect(screen.getByText("PNG")).toBeVisible();
    expect(screen.getByText("0.50 MB")).toBeVisible();
  });

  it("pushes correct URL when searching (Enter key & button click)", async () => {
    await act(async () => render(<DocumentTable />));
    await waitFor(() => expect(screen.queryByTestId("skeleton")).toBeNull());

    const input = screen.getByPlaceholderText("Search documents...");
    await userEvent.clear(input);
    await userEvent.type(input, "foo");

    // pressing Enter
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(pushMock).toHaveBeenLastCalledWith(
      "/admin?tab=documents&page=1&search=foo"
    );

    // clicking Search button
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(pushMock).toHaveBeenLastCalledWith(
      "/admin?tab=documents&page=1&search=foo"
    );
  });

  it("renders pagination component with the right props", async () => {
    await act(async () => render(<DocumentTable />));
    await waitFor(() => expect(screen.queryByTestId("skeleton")).toBeNull());
    expect(screen.getByTestId("pagination")).toHaveTextContent("1/2");
  });

  it("confirms before delete and re-fetches on confirm", async () => {
    // first, cancel the confirm dialog
    jest.spyOn(window, "confirm").mockReturnValueOnce(false);

    await act(async () => render(<DocumentTable />));
    await waitFor(() => expect(screen.queryByTestId("skeleton")).toBeNull());

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    // we should have prompted, but *not* called delete
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to permanently delete this document?"
    );
    expect(documentService.deleteDocumentPermanently).not.toHaveBeenCalled();

    // now accept the confirmation
    jest.spyOn(window, "confirm").mockReturnValueOnce(true);
    await userEvent.click(deleteButtons[0]);

    expect(documentService.deleteDocumentPermanently).toHaveBeenCalledWith(
      "doc1"
    );
    expect(toastMock).toHaveBeenCalledWith({
      title: "Document deleted",
      description: "The document has been permanently deleted.",
    });
    // initial fetch + one more after deletion
    expect(documentService.getDocuments).toHaveBeenCalledTimes(2);
  });

  it("shows “No documents found” if API returns an empty list", async () => {
    (documentService.getDocuments as jest.Mock).mockResolvedValueOnce({
      documents: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    });

    await act(async () => render(<DocumentTable />));
    await waitFor(() => expect(screen.queryByTestId("skeleton")).toBeNull());
    expect(screen.getByText("No documents found")).toBeVisible();
  });

  it("toasts an error if fetching documents fails", async () => {
    (documentService.getDocuments as jest.Mock).mockRejectedValueOnce(
      new Error("oopsie")
    );

    await act(async () => render(<DocumentTable />));
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "oopsie",
      });
    });
  });
});
