import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import QAPage from "@/app/qa/page"; // adjust if path differs
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { qaService } from "@/services/qa-service";

// ─── mocks ────────────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));
jest.mock("@/services/qa-service", () => ({
  qaService: {
    askQuestion: jest.fn(),
    getHistory: jest.fn(),
    deleteHistoryItem: jest.fn(),
    clearHistory: jest.fn(),
  },
}));
jest.mock("@/components/qa/chat-message", () => ({
  ChatMessage: ({ type, content }: any) => (
    <div data-testid={`chat-${type}`}>{content.answer ?? content}</div>
  ),
}));
jest.mock("@/components/qa/history-item", () => ({
  HistoryItem: ({ item, onClick }: any) => (
    <button data-testid="history-item" onClick={onClick}>
      {item.question}
    </button>
  ),
}));

// ─── helpers ──────────────────────────────────────────────────────────────────
const mockPush = jest.fn();
const mockToast = jest.fn();

beforeAll(() => {
  // polyfill scrollIntoView for JSDOM
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: jest.fn(),
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
    push: mockPush,
  });
  (useToast as jest.MockedFunction<typeof useToast>).mockReturnValue({
    toast: mockToast,
  });
});

// ─── tests ────────────────────────────────────────────────────────────────────
describe("QAPage", () => {
  test("redirects unauthenticated user", async () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(<QAPage />);

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/auth/login?redirect=/qa")
    );
  });

  test("shows skeleton while auth is loading", () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      user: null,
      isLoading: true,
    });

    const { container } = render(<QAPage />);

    // Skeletons have the animate-pulse class
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  test("submits a question and renders assistant reply", async () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      user: { id: "u1" },
      isLoading: false,
    });
    (qaService.askQuestion as jest.Mock).mockResolvedValue({
      answer: "42",
      sources: [],
    });

    render(<QAPage />);

    await userEvent.type(
      screen.getByPlaceholderText(/ask a question/i),
      "What is the answer?"
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByTestId("chat-assistant")).toHaveTextContent("42")
    );
    expect(qaService.askQuestion).toHaveBeenCalledWith("What is the answer?");
  });

  test("loads and shows history tab", async () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      user: { id: "u1" },
      isLoading: false,
    });
    (qaService.getHistory as jest.Mock).mockResolvedValue({
      history: [
        {
          _id: "h1",
          question: "Prev Q",
          answer: "Prev A",
          sources: [],
          confidence: 0.9,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    render(<QAPage />);

    await userEvent.click(screen.getByRole("tab", { name: /history/i }));

    await waitFor(() =>
      expect(screen.getByTestId("history-item")).toHaveTextContent("Prev Q")
    );
    expect(qaService.getHistory).toHaveBeenCalledWith(1);
  });

  test("clicking a history item populates chat", async () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      user: { id: "u1" },
      isLoading: false,
    });

    const historyItem = {
      _id: "h1",
      question: "Prev Q",
      answer: "Prev A",
      sources: [],
      confidence: 0.9,
    };

    (qaService.getHistory as jest.Mock).mockResolvedValue({
      history: [historyItem],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    render(<QAPage />);

    await userEvent.click(screen.getByRole("tab", { name: /history/i }));
    await userEvent.click(await screen.findByTestId("history-item"));

    expect(screen.getByTestId("chat-user")).toHaveTextContent("Prev Q");
    expect(screen.getByTestId("chat-assistant")).toHaveTextContent("Prev A");
  });
});
