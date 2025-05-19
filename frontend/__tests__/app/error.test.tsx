// __tests__/app/error.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorPage from "@/app/error";
import * as nextNavigation from "next/navigation";

// Mock next/navigation as an ES module
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));

describe("ErrorPage Component", () => {
  const mockReset = jest.fn();
  const mockError = new globalThis.Error("Test error message");
  const mockRouter = { push: jest.fn() };

  beforeAll(() => {
    // Spy on console.error so it doesn't spam the test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders the error component correctly", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);

    // Title and description should render
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We apologize for the inconvenience. Please try again or contact support if the problem persists."
      )
    ).toBeInTheDocument();

    // Both buttons should render
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("Go back home")).toBeInTheDocument();
  });

  it("calls reset function when 'Try again' button is clicked", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("renders a link back home with correct href", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const homeLink = screen.getByText("Go back home").closest("a");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("logs the error to console", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
