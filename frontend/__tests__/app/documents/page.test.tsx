/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DocumentsPage from "@/app/documents/page";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { documentService } from "@/services/document-service";

// Stub child components
jest.mock("@/components/documents/document-card", () => ({
  __esModule: true,
  default: () => <div data-testid="DOC_CARD" />,
}));
jest.mock("@/components/documents/document-upload-button", () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <button data-testid="UPLOAD_BTN" onClick={onSuccess}>
      Upload
    </button>
  ),
}));
jest.mock("@/components/pagination", () => ({
  __esModule: true,
  default: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (n: number) => void;
  }) => (
    <div data-testid="PAGINATION">
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}));

// Mock hooks & services
jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("@/services/document-service", () => ({
  documentService: {
    getDocuments: jest.fn(),
    deleteDocument: jest.fn(), // stubbed but not tested
  },
}));

describe("<DocumentsPage />", () => {
  const push = jest.fn();
  const toast = jest.fn();
  const fakeUser = { _id: "user1" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: fakeUser });
    (useToast as jest.Mock).mockReturnValue({ toast });
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) => (k === "page" ? "1" : ""),
      toString: () => "",
    });
  });

  it("shows skeletons while loading", () => {
    (documentService.getDocuments as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );
    render(<DocumentsPage />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("renders document cards when fetched", async () => {
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [
        {
          _id: "d1",
          tags: [],
          fileType: "pdf",
          createdBy: fakeUser,
          fileSize: 123,
        },
        {
          _id: "d2",
          tags: [],
          fileType: "pdf",
          createdBy: fakeUser,
          fileSize: 456,
        },
      ],
      pagination: { page: 1, pages: 1, total: 2, limit: 10 },
    });
    render(<DocumentsPage />);
    expect(await screen.findAllByTestId("DOC_CARD")).toHaveLength(2);
  });

  it("shows empty state when no documents", async () => {
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [],
      pagination: { page: 1, pages: 1, total: 0, limit: 10 },
    });
    render(<DocumentsPage />);
    expect(await screen.findByText(/No documents found/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("UPLOAD_BTN").length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("navigates on search", async () => {
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [],
      pagination: { page: 1, pages: 1, total: 0, limit: 10 },
    });
    render(<DocumentsPage />);
    // wait for the search button to appear
    await screen.findByRole("button", { name: /^Search$/i });

    fireEvent.change(screen.getByPlaceholderText("Search documents..."), {
      target: { value: "foo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));

    expect(push).toHaveBeenCalledTimes(1);
    const url = (push as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("search=foo");
    expect(url).toContain("page=1");
  });

  it("clears filters when Clear clicked", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) => (k === "search" ? "foo" : k === "page" ? "1" : ""),
      toString: () => "search=foo&page=1",
    });
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [
        {
          _id: "d1",
          tags: [],
          fileType: "pdf",
          createdBy: fakeUser,
          fileSize: 0,
        },
      ],
      pagination: { page: 1, pages: 1, total: 1, limit: 10 },
    });
    render(<DocumentsPage />);
    const clearBtn = await screen.findByRole("button", { name: /Clear/i });
    fireEvent.click(clearBtn);
    expect(push).toHaveBeenCalledWith("/documents");
  });

  it("navigates to next page on pagination click", async () => {
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [
        {
          _id: "d1",
          tags: [],
          fileType: "pdf",
          createdBy: fakeUser,
          fileSize: 0,
        },
      ],
      pagination: { page: 1, pages: 3, total: 3, limit: 10 },
    });
    render(<DocumentsPage />);
    const nextBtn = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);
    expect(push).toHaveBeenCalledWith(expect.stringContaining("page=2"));
  });

  it("re-fetches documents on upload success", async () => {
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [],
      pagination: { page: 1, pages: 1, total: 0, limit: 10 },
    });
    render(<DocumentsPage />);
    const uploadBtn = await screen.findByTestId("UPLOAD_BTN");
    fireEvent.click(uploadBtn);
    // called once on mount, once on upload
    expect(documentService.getDocuments).toHaveBeenCalledTimes(2);
  });

  it("shows error toast on fetch failure", async () => {
    (documentService.getDocuments as jest.Mock).mockRejectedValue(
      new Error("fetch-fail")
    );
    render(<DocumentsPage />);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "fetch-fail",
        })
      )
    );
  });

  it("initializes search input from URL", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) =>
        k === "search" ? "initValue" : k === "page" ? "1" : "",
      toString: () => "search=initValue&page=1",
    });
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [],
      pagination: { page: 1, pages: 1, total: 0, limit: 10 },
    });
    render(<DocumentsPage />);
    const input = await screen.findByPlaceholderText("Search documents...");
    expect((input as HTMLInputElement).value).toBe("initValue");
  });

  it("maintains existing search when paginating", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) => (k === "search" ? "keepMe" : k === "page" ? "2" : ""),
      toString: () => "search=keepMe&page=2",
    });
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [
        {
          _id: "d1",
          tags: [],
          fileType: "pdf",
          createdBy: fakeUser,
          fileSize: 0,
        },
      ],
      pagination: { page: 2, pages: 5, total: 50, limit: 10 },
    });
    render(<DocumentsPage />);
    const nextBtn = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);
    expect(push).toHaveBeenCalledWith(expect.stringContaining("search=keepMe"));
    expect(push).toHaveBeenCalledWith(expect.stringContaining("page=3"));
  });

  it("prefills the search box from ?search=", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) =>
        k === "search" ? "prefilled" : k === "page" ? "1" : "",
      toString: () => "search=prefilled&page=1",
    });
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [],
      pagination: { page: 1, pages: 1, total: 0, limit: 10 },
    });
    render(<DocumentsPage />);
    const input = await screen.findByPlaceholderText("Search documents...");
    expect((input as HTMLInputElement).value).toBe("prefilled");
  });

  it("passes tags from URL to the fetch call", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) =>
        k === "tags"
          ? "tagA,tagB"
          : k === "search"
          ? ""
          : k === "page"
          ? "1"
          : "",
      toString: () => "search=&tags=tagA,tagB&page=1",
    });
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [],
      pagination: { page: 1, pages: 1, total: 0, limit: 10 },
    });
    render(<DocumentsPage />);
    // wait until first fetch completes
    await waitFor(() =>
      expect(documentService.getDocuments).toHaveBeenCalled()
    );
    expect(
      (documentService.getDocuments as jest.Mock).mock.calls[0][0]
    ).toEqual(
      expect.objectContaining({
        page: 1,
        search: "",
        tags: "tagA,tagB",
      })
    );
  });

  it("maintains search & tags when clicking Next page", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) =>
        k === "search"
          ? "keep"
          : k === "tags"
          ? "x,y"
          : k === "page"
          ? "2"
          : "",
      toString: () => "search=keep&tags=x,y&page=2",
    });
    (documentService.getDocuments as jest.Mock).mockResolvedValue({
      documents: [
        {
          _id: "d1",
          tags: [],
          fileType: "pdf",
          createdBy: fakeUser,
          fileSize: 0,
        },
      ],
      pagination: { page: 2, pages: 3, total: 3, limit: 10 },
    });
    render(<DocumentsPage />);
    const nextBtn = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);
    const pushed = (push as jest.Mock).mock.calls.slice(-1)[0][0];
    expect(pushed).toContain("search=keep");
    expect(pushed).toContain("tags=x%2Cy");
    expect(pushed).toContain("page=3");
  });
});
