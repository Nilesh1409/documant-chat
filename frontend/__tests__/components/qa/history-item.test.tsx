"use client";

import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryItem } from "@/components/qa/history-item";
import { formatDistanceToNow } from "date-fns";
// Import jest to declare it

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(),
}));

describe("HistoryItem component", () => {
  const mockItem = {
    _id: "history1",
    question: "What is the project timeline?",
    answer: "The project is scheduled to be completed by the end of Q2.",
    confidence: "high",
    sources: [{ documentId: "doc1", title: "Project Plan" }],
    createdAt: "2023-01-01T00:00:00.000Z",
  };

  const mockOnDelete = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (formatDistanceToNow as jest.Mock).mockReturnValue("2 months ago");
  });

  it("should render history item with correct information", () => {
    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    // Check question and answer
    expect(
      screen.getByText("What is the project timeline?")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The project is scheduled to be completed by the end of Q2."
      )
    ).toBeInTheDocument();

    // Check timestamp
    expect(screen.getByText("2 months ago")).toBeInTheDocument();

    // Check confidence badge
    expect(screen.getByText("high")).toBeInTheDocument();

    // Check sources count
    expect(screen.getByText("1 source")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    // Click the history item
    fireEvent.click(screen.getByText("What is the project timeline?"));

    // onClick should be called
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("should call onDelete when delete button is clicked", () => {
    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    // Click the delete button
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    // onDelete should be called
    expect(mockOnDelete).toHaveBeenCalled();

    // onClick should not be called
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("should handle item without confidence", () => {
    const itemWithoutConfidence = {
      ...mockItem,
      confidence: undefined,
    };

    render(
      <HistoryItem
        item={itemWithoutConfidence}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    // Confidence badge should not be present
    expect(screen.queryByText("high")).not.toBeInTheDocument();
  });

  it("should handle item without sources", () => {
    const itemWithoutSources = {
      ...mockItem,
      sources: undefined,
    };

    render(
      <HistoryItem
        item={itemWithoutSources}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    // Sources count should not be present
    expect(screen.queryByText("1 source")).not.toBeInTheDocument();
  });

  it("should handle plural sources text", () => {
    const itemWithMultipleSources = {
      ...mockItem,
      sources: [
        { documentId: "doc1", title: "Project Plan" },
        { documentId: "doc2", title: "Budget Report" },
      ],
    };

    render(
      <HistoryItem
        item={itemWithMultipleSources}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    // Sources count should be plural
    expect(screen.getByText("2 sources")).toBeInTheDocument();
  });

  it("should prevent event propagation when delete button is clicked", () => {
    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    // Get the delete button
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    // Create a mock event
    const mockEvent = { stopPropagation: jest.fn() };

    // Simulate click with the mock event
    // Note: fireEvent doesn't actually call stopPropagation, so we need to modify our test
    // Instead of checking if stopPropagation was called, we'll check if onClick wasn't called
    fireEvent.click(deleteButton);

    // onDelete should be called
    expect(mockOnDelete).toHaveBeenCalled();

    // onClick should not be called, which indicates event propagation was stopped
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
