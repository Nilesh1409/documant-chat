import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentPage from "@/app/documents/[id]/page";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useParams } from "next/navigation";
import { documentService } from "@/services/document-service";
import { qaService } from "@/services/qa-service";

// Stub globals
beforeAll(() => {
  jest.spyOn(window, "confirm").mockReturnValue(true);
  Object.defineProperty(window.URL, "createObjectURL", {
    value: jest.fn(() => "blob:url"),
    writable: true,
  });
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("@/services/document-service", () => ({
  documentService: {
    getDocumentById: jest.fn(),
    getDocumentVersions: jest.fn(),
    deleteDocument: jest.fn(),
    downloadDocument: jest.fn(),
    downloadDocumentVersion: jest.fn(),
  },
}));
jest.mock("@/services/qa-service", () => ({
  qaService: { indexDocument: jest.fn() },
}));

describe("DocumentPage", () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  const baseDocument = {
    _id: "doc1",
    title: "Test Doc",
    updatedAt: new Date().toISOString(),
    createdAt: new Date("2020-01-01").toISOString(),
    fileType: "application/pdf",
    fileSize: 1024 * 1024,
    createdBy: { _id: "u1", fullName: "Alice" },
    description: "A test document",
    tags: ["tag1", "tag2"],
  };

  const baseVersion = {
    _id: "v1",
    versionNumber: 1,
    createdAt: new Date("2020-02-01").toISOString(),
    createdBy: { _id: "u1", fullName: "Alice" },
    changeSummary: "Initial upload",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { _id: "u1" },
      isLoading: false,
    });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: "doc1" });
    (documentService.getDocumentVersions as jest.Mock).mockResolvedValue([]);
  });

  it("shows loading skeletons before data", () => {
    (documentService.getDocumentById as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );
    render(<DocumentPage />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("handles fetch error by toast and redirect", async () => {
    (documentService.getDocumentById as jest.Mock).mockRejectedValueOnce(
      new Error("Network")
    );
    render(<DocumentPage />);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive", title: "Error" })
      );
      expect(mockPush).toHaveBeenCalledWith("/documents");
    });
  });

  it("renders not-found when document is null", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValueOnce({
      document: null,
      latestVersion: null,
    });
    render(<DocumentPage />);
    expect(await screen.findByText(/Document not found/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to documents/i })
    ).toHaveAttribute("href", "/documents");
  });

  it("renders document details and owner actions", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValueOnce({
      document: baseDocument,
      latestVersion: baseVersion,
    });
    (documentService.getDocumentVersions as jest.Mock).mockResolvedValueOnce([
      baseVersion,
      { ...baseVersion, versionNumber: 2, _id: "v2", changeSummary: "Update" },
    ]);
    render(<DocumentPage />);

    // Title and metadata
    expect(
      await screen.findByRole("heading", { level: 1, name: /Test Doc/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/A test document/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();

    // Tags
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();

    // File size appears twice
    expect(screen.getAllByText(/1\.00 MB/)).toHaveLength(2);

    // Tabs
    expect(screen.getByRole("tab", { name: /Preview/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Versions \(2\)/i })
    ).toBeInTheDocument();

    // Download latest
    (documentService.downloadDocument as jest.Mock).mockResolvedValue(
      new Blob()
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /Download/i })[0]
    );
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Download started" })
      )
    );

    // Index
    (qaService.indexDocument as jest.Mock).mockResolvedValue(undefined);
    await userEvent.click(
      screen.getByRole("button", { name: /Index for Q&A/i })
    );
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Document indexed" })
      )
    );

    // Delete
    (documentService.deleteDocument as jest.Mock).mockResolvedValue(undefined);
    await userEvent.click(screen.getByRole("button", { name: /Delete/i }));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Document deleted" })
      )
    );
    expect(mockPush).toHaveBeenCalledWith("/documents");
  });

  it("toggles preview and version tabs correctly", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValueOnce({
      document: baseDocument,
      latestVersion: baseVersion,
    });
    (documentService.getDocumentVersions as jest.Mock).mockResolvedValueOnce([
      baseVersion,
    ]);
    (documentService.downloadDocumentVersion as jest.Mock).mockResolvedValue(
      new Blob()
    );

    render(<DocumentPage />);
    await screen.findByRole("heading", { level: 1 });

    // Switch to Versions tab
    await userEvent.click(screen.getByRole("tab", { name: /Versions/ }));
    expect(screen.getByText(/Version 1/)).toBeInTheDocument();

    // Download specific version
    await userEvent.click(
      screen.getAllByRole("button", { name: /Download/i })[1]
    );
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Download started" })
      )
    );

    // Switch back to Preview
    await userEvent.click(screen.getByRole("tab", { name: /Preview/ }));
    expect(
      screen.getByRole("button", { name: /Download to view/i })
    ).toBeInTheDocument();
  });

  it("hides owner actions for non-owner", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { _id: "other" },
      isLoading: false,
    });
    (documentService.getDocumentById as jest.Mock).mockResolvedValueOnce({
      document: baseDocument,
      latestVersion: baseVersion,
    });
    (documentService.getDocumentVersions as jest.Mock).mockResolvedValueOnce(
      []
    );
    render(<DocumentPage />);
    expect(
      await screen.findByRole("heading", { level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Edit/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete/i })
    ).not.toBeInTheDocument();
  });
});
