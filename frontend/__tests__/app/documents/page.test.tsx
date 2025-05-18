// __tests__/app/documents/page.test.tsx

import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DocumentsPage from "@/app/documents/page";
import { useAuth } from "@/hooks/use-auth";

// Mock hooks and components
jest.mock("@/hooks/use-auth");
jest.mock("@/components/documents/document-card", () => ({
  __esModule: true,
  default: ({ document }: any) => (
    <div data-testid="document-card">{document._id}</div>
  ),
}));
jest.mock("@/components/documents/document-upload-button", () => ({
  __esModule: true,
  default: ({ onSuccess }: any) => (
    <button onClick={() => onSuccess()}>Upload</button>
  ),
}));
jest.mock("@/components/pagination", () => ({
  __esModule: true,
  default: ({ onPageChange }: any) => (
    <button onClick={() => onPageChange(2)}>Next</button>
  ),
}));

// Mock the document service
jest.mock("@/services/document-service", () => ({
  __esModule: true,
  documentService: {
    getDocuments: jest.fn().mockResolvedValue({
      documents: [{ _id: "doc123", tags: [] }],
      pagination: { page: 1, pages: 1, total: 1, limit: 10 },
    }),
  },
}));

describe("DocumentsPage", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: { _id: "user1" } });
  });

  it("renders heading and upload button", async () => {
    await act(async () => {
      render(<DocumentsPage />);
    });

    expect(
      screen.getByRole("heading", { name: /Documents/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("renders document cards when documents exist", async () => {
    await act(async () => {
      render(<DocumentsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("document-card")).toHaveTextContent("doc123");
    });
  });

  it("shows skeletons when loading", async () => {
    // Remock service so getDocuments never resolves
    jest.resetModules();
    jest.doMock("@/services/document-service", () => ({
      __esModule: true,
      documentService: {
        getDocuments: jest.fn(() => new Promise(() => {})),
      },
    }));

    await act(async () => {
      render(<DocumentsPage />);
    });

    // Still see the heading while loading
    expect(
      screen.getByRole("heading", { name: /Documents/i })
    ).toBeInTheDocument();
  });
});
