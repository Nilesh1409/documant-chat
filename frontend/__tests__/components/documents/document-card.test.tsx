import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentCard from "@/components/documents/document-card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { documentService } from "@/services/document-service";
import { formatDistanceToNow } from "date-fns";

// stub window.confirm globally
beforeAll(() => {
  jest.spyOn(window, "confirm").mockImplementation(() => true);
});

jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("@/services/document-service", () => ({
  documentService: { deleteDocument: jest.fn() },
}));

describe("<DocumentCard />", () => {
  const mockToast = jest.fn();
  const onDelete = jest.fn();
  const now = new Date().toISOString();
  const updatedAgo = formatDistanceToNow(new Date(now), { addSuffix: true });

  const doc = {
    _id: "doc1",
    title: "Test Document",
    description: "A short description.",
    updatedAt: now,
    createdBy: { _id: "u1", fullName: "Alice" },
    fileType: "application/pdf",
    fileUrl: "http://example.com/doc.pdf",
    tags: ["tag1", "tag2"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { _id: "u1" } });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it("renders title (as a link), description, updated time and creator", () => {
    render(<DocumentCard document={doc} onDelete={onDelete} />);

    // Title is rendered as a <Link>
    const titleLink = screen.getByRole("link", { name: /Test Document/i });
    expect(titleLink).toHaveAttribute("href", `/documents/${doc._id}`);

    // Description
    expect(screen.getByText("A short description.")).toBeInTheDocument();

    // Updated time
    expect(screen.getByText(new RegExp(updatedAgo))).toBeInTheDocument();

    // Creator name
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it("always shows View, Download, and Version history menu items", async () => {
    render(<DocumentCard document={doc} onDelete={onDelete} />);

    // Open the dropdown
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));

    // These appear as role="menuitem"
    expect(
      screen.getByRole("menuitem", { name: /view document/i })
    ).toHaveAttribute("href", `/documents/${doc._id}`);
    expect(screen.getByRole("menuitem", { name: /download/i })).toHaveAttribute(
      "href",
      doc.fileUrl
    );
    expect(
      screen.getByRole("menuitem", { name: /version history/i })
    ).toHaveAttribute("href", `/documents/${doc._id}/versions`);
  });

  it("shows Edit, Manage permissions, and Delete for owner", async () => {
    render(<DocumentCard document={doc} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));

    expect(screen.getByRole("menuitem", { name: /edit/i })).toHaveAttribute(
      "href",
      `/documents/${doc._id}/edit`
    );
    expect(
      screen.getByRole("menuitem", { name: /manage permissions/i })
    ).toHaveAttribute("href", `/documents/${doc._id}/permissions`);
    // Delete is also a menuitem (not a link)
    expect(
      screen.getByRole("menuitem", { name: /^delete$/i })
    ).toBeInTheDocument();
  });

  it("invokes delete flow: calls API, shows toast, and triggers onDelete", async () => {
    (documentService.deleteDocument as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    render(<DocumentCard document={doc} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /^delete$/i }));

    await waitFor(() =>
      expect(documentService.deleteDocument).toHaveBeenCalledWith(doc._id, "u1")
    );
    expect(mockToast).toHaveBeenCalledWith({
      title: "Document deleted",
      description: "The document has been deleted successfully.",
    });
    expect(onDelete).toHaveBeenCalled();
  });

  it("shows error toast if deleteDocument throws", async () => {
    // suppress component console.error
    jest.spyOn(console, "error").mockImplementation(() => {});
    (documentService.deleteDocument as jest.Mock).mockRejectedValueOnce(
      new Error("Oops")
    );

    render(<DocumentCard document={doc} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /^delete$/i }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "Oops",
        })
      )
    );
    expect(onDelete).not.toHaveBeenCalled();
  });
});
