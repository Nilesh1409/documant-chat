import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DocumentUploadButton from "@/components/documents/document-upload-button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/document-service";

// Mock external hooks and services
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));
jest.mock("@/services/document-service", () => ({
  documentService: {
    createDocument: jest.fn(),
  },
}));

describe("DocumentUploadButton", () => {
  const mockUser = { _id: "user1", email: "user@example.com" };
  const mockRouter = { push: jest.fn() };
  const mockToast = { toast: jest.fn() };
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error to avoid noise during error tests
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Authenticated by default
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    // Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);
    // Router
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders the upload button", () => {
    render(<DocumentUploadButton onSuccess={onSuccess} />);
    expect(
      screen.getByRole("button", { name: /upload document/i })
    ).toBeInTheDocument();
  });

  it("opens the dialog when clicked", () => {
    render(<DocumentUploadButton onSuccess={onSuccess} />);
    const trigger = screen.getByRole("button", { name: /upload document/i });
    fireEvent.click(trigger);
    expect(
      screen.getByText(/upload a new document to your collection/i)
    ).toBeInTheDocument();
  });

  it("validates form fields", async () => {
    render(<DocumentUploadButton onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: /upload document/i }));
    fireEvent.click(screen.getByRole("button", { name: /upload$/i }));
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it("handles file selection and displays filename", async () => {
    render(<DocumentUploadButton onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: /upload document/i }));

    const file = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });
    const input = document.querySelector(
      "input[type=file]"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/test.pdf/)).toBeInTheDocument();
    });
  });

  it("uploads document successfully with default fields", async () => {
    (documentService.createDocument as jest.Mock).mockResolvedValueOnce({
      _id: "doc1",
      title: "Doc1",
    });

    render(<DocumentUploadButton onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: /upload document/i }));

    // fill title only
    fireEvent.change(screen.getByPlaceholderText(/document title/i), {
      target: { value: "Doc1" },
    });
    // select file
    const file = new File(["content"], "file.pdf", { type: "application/pdf" });
    const input = document.querySelector(
      "input[type=file]"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // submit
    fireEvent.click(screen.getByRole("button", { name: /upload$/i }));

    await waitFor(() => {
      expect(documentService.createDocument).toHaveBeenCalledWith({
        title: "Doc1",
        description: "",
        tags: [],
        file,
        userId: "user1",
      });
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Document uploaded" })
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(
        screen.queryByText(/upload a new document to your collection/i)
      ).toBeNull();
    });
  });

  it("redirects to login if not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<DocumentUploadButton onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: /upload document/i }));
    fireEvent.change(screen.getByPlaceholderText(/document title/i), {
      target: { value: "Doc1" },
    });
    const file = new File(["content"], "file.pdf", { type: "application/pdf" });
    const input = document.querySelector(
      "input[type=file]"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /upload$/i }));

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Authentication required",
        })
      );
      expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("handles upload errors gracefully", async () => {
    (documentService.createDocument as jest.Mock).mockRejectedValueOnce(
      new Error("Oops")
    );

    render(<DocumentUploadButton onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: /upload document/i }));
    fireEvent.change(screen.getByPlaceholderText(/document title/i), {
      target: { value: "Doc1" },
    });
    const file = new File(["content"], "file.pdf", { type: "application/pdf" });
    const input = document.querySelector(
      "input[type=file]"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /upload$/i }));

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Upload failed",
          description: "Oops",
        })
      );
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});
