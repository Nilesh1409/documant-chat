/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EditDocumentPage from "@/app/documents/[id]/edit/page";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/document-service";
import { z } from "zod";

// mock next/link so asChild Buttons still render their text
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

// mock lucide icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="ICON-ARROW" />,
  Save: () => <span data-testid="ICON-SAVE" />,
  Loader2: () => <span data-testid="ICON-LOADER" />,
}));

// mock hooks & services
jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/services/document-service", () => ({
  documentService: {
    getDocumentById: jest.fn(),
    updateDocument: jest.fn(),
  },
}));

describe("<EditDocumentPage />", () => {
  const push = jest.fn();
  const toast = jest.fn();
  const fakeParams = { id: "doc123" };
  const fakeDoc = {
    title: "My Doc",
    description: "Desc",
    tags: ["one", "two"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { _id: "u1" } });
    (useToast as jest.Mock).mockReturnValue({ toast });
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("shows skeletons while loading", () => {
    (documentService.getDocumentById as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );
    render(<EditDocumentPage params={fakeParams} />);
    // check for at least one Skeleton class
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("fetch error → shows toast and redirects to /documents", async () => {
    (documentService.getDocumentById as jest.Mock).mockRejectedValue(
      new Error("fetch-fail")
    );
    render(<EditDocumentPage params={fakeParams} />);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "fetch-fail",
        })
      )
    );
    expect(push).toHaveBeenCalledWith("/documents");
  });

  it("document not found → shows not-found UI", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValue({
      document: null,
    });
    render(<EditDocumentPage params={fakeParams} />);
    expect(await screen.findByText(/Document not found/i)).toBeInTheDocument();
    expect(screen.getByText("Back to documents")).toBeInTheDocument();
  });

  it("fetch success → form is pre-filled", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValue({
      document: fakeDoc,
    });
    render(<EditDocumentPage params={fakeParams} />);
    expect(await screen.findByDisplayValue("My Doc")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
    expect(screen.getByDisplayValue("one, two")).toBeInTheDocument();
  });

  it("validation error shows messages", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValue({
      document: fakeDoc,
    });
    render(<EditDocumentPage params={fakeParams} />);
    await screen.findByDisplayValue("My Doc");

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
  });

  it("not logged in → onSubmit shows auth toast and redirect", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (documentService.getDocumentById as jest.Mock).mockResolvedValue({
      document: fakeDoc,
    });
    render(<EditDocumentPage params={fakeParams} />);
    await screen.findByDisplayValue("My Doc");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Authentication required",
        })
      )
    );
    expect(push).toHaveBeenCalledWith("/auth/login");
  });

  it("onSubmit success → calls updateDocument, shows toast, redirects", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValue({
      document: fakeDoc,
    });
    (documentService.updateDocument as jest.Mock).mockResolvedValue({});
    render(<EditDocumentPage params={fakeParams} />);

    await screen.findByDisplayValue("My Doc");
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated" },
    });
    fireEvent.change(screen.getByLabelText("Tags"), {
      target: { value: "a, b,,c" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() =>
      expect(documentService.updateDocument).toHaveBeenCalledWith(
        "doc123",
        { title: "Updated", description: "Desc", tags: ["a", "b", "c"] },
        "u1"
      )
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Document updated",
      })
    );
    expect(push).toHaveBeenCalledWith("/documents/doc123");
  });

  it("onSubmit failure → shows destructive toast", async () => {
    (documentService.getDocumentById as jest.Mock).mockResolvedValue({
      document: fakeDoc,
    });
    (documentService.updateDocument as jest.Mock).mockRejectedValue(
      new Error("update-fail")
    );
    render(<EditDocumentPage params={fakeParams} />);

    await screen.findByDisplayValue("My Doc");
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Update failed",
          description: "update-fail",
        })
      )
    );
  });
});
