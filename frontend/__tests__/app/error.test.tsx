import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import Error from "@/app/error";
import { useRouter } from "next/navigation";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("Error Component", () => {
  const mockReset = jest.fn();
  const mockError = new Error("Test error message");
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders the error component correctly", () => {
    render(<Error error={mockError} reset={mockReset} />);

    // Check that the error icon is displayed
    expect(screen.getByTestId("error-icon")).toBeInTheDocument();

    // Check that the error title is displayed
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();

    // Check that the error message is displayed
    expect(
      screen.getByText(
        "We apologize for the inconvenience. Please try again or contact support if the problem persists."
      )
    ).toBeInTheDocument();

    // Check that the buttons are displayed
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("Go back home")).toBeInTheDocument();
  });

  it("calls reset function when 'Try again' button is clicked", () => {
    render(<Error error={mockError} reset={mockReset} />);

    // Click the "Try again" button
    fireEvent.click(screen.getByText("Try again"));

    // Check that the reset function was called
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("navigates to home when 'Go back home' button is clicked", () => {
    render(<Error error={mockError} reset={mockReset} />);

    // Click the "Go back home" button
    fireEvent.click(screen.getByText("Go back home"));

    // Check that the router.push function was called with "/"
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("logs the error to console", () => {
    render(<Error error={mockError} reset={mockReset} />);

    // Check that console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
