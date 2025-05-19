/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentVersionUpload from "@/components/documents/document-version-upload";
import { documentService } from "@/services/document-service";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

jest.mock("@/services/document-service", () => ({
  documentService: {
    uploadNewVersion: jest.fn(),
  },
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("<DocumentVersionUpload />", () => {
  const mockUser = { _id: "u1", name: "Test User" };
  const toastMock = jest.fn();
  const onSuccessMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useToast as jest.Mock).mockReturnValue({ toast: toastMock });
  });

  const setup = async () => {
    render(
      <DocumentVersionUpload documentId="doc1" onSuccess={onSuccessMock} />
    );
    userEvent.click(
      screen.getByRole("button", { name: /upload new version/i })
    );
    await screen.findByText(/upload a new version/i);
  };

  it("renders trigger button", () => {
    render(
      <DocumentVersionUpload documentId="doc1" onSuccess={onSuccessMock} />
    );
    expect(screen.getByText(/upload new version/i)).toBeInTheDocument();
  });

  it("opens and closes the dialog", async () => {
    await setup();
    userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(
        screen.queryByText(/upload a new version/i)
      ).not.toBeInTheDocument();
    });
  });

  it("successfully uploads file", async () => {
    (documentService.uploadNewVersion as jest.Mock).mockResolvedValue({});

    await setup();

    const fileInput = screen.getByLabelText(/file/i) as HTMLInputElement;
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await userEvent.type(
      screen.getByPlaceholderText(/describe what changed/i),
      "Updated document"
    );
    userEvent.click(screen.getByText(/upload version/i));

    await waitFor(() => {
      expect(documentService.uploadNewVersion).toHaveBeenCalledWith(
        "doc1",
        expect.objectContaining({
          file,
          changeSummary: "Updated document",
          userId: mockUser._id,
        })
      );
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Version uploaded",
        })
      );
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it("handles upload failure gracefully", async () => {
    (documentService.uploadNewVersion as jest.Mock).mockRejectedValue(
      new Error("Network Error")
    );

    await setup();

    const fileInput = screen.getByLabelText(/file/i) as HTMLInputElement;
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    userEvent.click(screen.getByText(/upload version/i));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Upload failed",
          description: "Network Error",
        })
      );
    });
  });

  it("validates file size and type correctly", async () => {
    await setup();

    const fileInput = screen.getByLabelText(/file/i) as HTMLInputElement;

    // Too large file
    const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "big.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [bigFile] } });
    userEvent.click(screen.getByText(/upload version/i));
    expect(
      await screen.findByText(/file size must be less than 10MB/i)
    ).toBeInTheDocument();

    // Wrong file type
    const wrongTypeFile = new File(["content"], "wrong.exe", {
      type: "application/octet-stream",
    });
    fireEvent.change(fileInput, { target: { files: [wrongTypeFile] } });
    userEvent.click(screen.getByText(/upload version/i));
    expect(
      await screen.findByText(/file type must be one of/i)
    ).toBeInTheDocument();
  });

  it("handles unauthenticated upload attempt", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    await setup();

    const fileInput = screen.getByLabelText(/file/i) as HTMLInputElement;
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    userEvent.click(screen.getByText(/upload version/i));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Authentication required",
        })
      );
    });
  });
});
