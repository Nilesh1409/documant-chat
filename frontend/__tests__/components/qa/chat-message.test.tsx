// __tests__/components/qa/chat-message.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatMessage } from "@/components/qa/chat-message";

// Mock next/link so it just renders an <a>
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons with svg+testid+aria-hidden so role="img" tests work
jest.mock("lucide-react", () => ({
  __esModule: true,
  User: (props: any) => (
    <svg role="img" aria-hidden="true" data-testid="UserIcon" {...props} />
  ),
  Bot: (props: any) => (
    <svg role="img" aria-hidden="true" data-testid="BotIcon" {...props} />
  ),
  FileText: (props: any) => (
    <svg role="img" aria-hidden="true" data-testid="FileTextIcon" {...props} />
  ),
  ChevronDown: (props: any) => (
    <svg
      role="img"
      aria-hidden="true"
      data-testid="ChevronDownIcon"
      {...props}
    />
  ),
  ChevronUp: (props: any) => (
    <svg role="img" aria-hidden="true" data-testid="ChevronUpIcon" {...props} />
  ),
}));

describe("ChatMessage component", () => {
  it("renders a user message with icon and content", () => {
    render(<ChatMessage type="user" content="Hello, world!" />);

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    expect(screen.getByTestId("UserIcon")).toBeInTheDocument();
  });

  it("renders an assistant message with badge, icon and answer", () => {
    const content = { answer: "Hi there", sources: [], confidence: "high" };
    render(<ChatMessage type="assistant" content={content} />);

    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("Hi there")).toBeInTheDocument();
    expect(screen.getByText("High confidence")).toBeInTheDocument();
    expect(screen.getByTestId("BotIcon")).toBeInTheDocument();
  });

  it("does not render a Sources section when sources is empty", () => {
    const content = { answer: "No sources", confidence: "medium" };
    render(<ChatMessage type="assistant" content={content} />);

    expect(screen.getByText("No sources")).toBeInTheDocument();
    expect(screen.queryByText(/Sources/)).toBeNull();
  });

  it("defaults to medium confidence if none provided", () => {
    const content = { answer: "Default badge", sources: [] };
    render(<ChatMessage type="assistant" content={content} />);

    expect(screen.getByText("Medium confidence")).toBeInTheDocument();
  });

  it("renders and expands the Sources section with excerpts", () => {
    const content = {
      answer: "See docs below",
      confidence: "low",
      sources: [
        {
          documentId: "doc1",
          title: "Project Plan",
          excerpts: ["Deadline is next week."],
        },
      ],
    };

    render(<ChatMessage type="assistant" content={content} />);

    // Trigger expand
    const btn = screen.getByRole("button", { name: /Sources \(1\)/ });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    // Now the list item and link should appear
    expect(screen.getByText("Project Plan")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Project Plan" });
    expect(link).toHaveAttribute("href", "/documents/doc1");

    // Excerpt still hidden until toggled
    expect(screen.queryByText(/"Deadline is next week\."/)).toBeNull();

    // Toggle excerpts
    const allButtons = screen.getAllByRole("button");
    const excerptToggle = allButtons.find((b) => b.textContent === "");
    fireEvent.click(excerptToggle!);

    expect(screen.getByText(/"Deadline is next week\."/)).toBeInTheDocument();

    // Collapse again
    fireEvent.click(excerptToggle!);
    expect(screen.queryByText(/"Deadline is next week\."/)).toBeNull();
  });

  it("renders metadata author when present", () => {
    const content = {
      answer: "Authored excerpt",
      confidence: "medium",
      sources: [
        {
          documentId: "doc2",
          title: "Budget Report",
          excerpts: ["Budget is $100k."],
          metadata: { author: "Finance Team" },
        },
      ],
    };

    render(<ChatMessage type="assistant" content={content} />);
    fireEvent.click(screen.getByRole("button", { name: /Sources \(1\)/ }));

    expect(screen.getByText("By Finance Team")).toBeInTheDocument();
  });

  it("correctly handles low, medium, and high confidence badges", () => {
    const low = { answer: "Low", sources: [], confidence: "low" as const };
    const medium = {
      answer: "Med",
      sources: [],
      confidence: "medium" as const,
    };
    const high = { answer: "High", sources: [], confidence: "high" as const };

    const { rerender } = render(<ChatMessage type="assistant" content={low} />);
    expect(screen.getByText("Low confidence")).toBeInTheDocument();

    rerender(<ChatMessage type="assistant" content={medium} />);
    expect(screen.getByText("Medium confidence")).toBeInTheDocument();

    rerender(<ChatMessage type="assistant" content={high} />);
    expect(screen.getByText("High confidence")).toBeInTheDocument();
  });
});
