import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import NotFound from "@/app/not-found";
import { useRouter } from "next/navigation";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("NotFound Component", () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders the not found component correctly", () => {
    render(<NotFound />);

    // Check that the not found icon is displayed
    expect(screen.getByTestId("not-found-icon")).toBeInTheDocument();

    // Check that the 404 text is displayed
    expect(screen.getByText("404")).toBeInTheDocument();

    // Check that the not found title is displayed
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();

    // Check that the not found message is displayed
    expect(
      screen.getByText(
        "The page you are looking for doesn't exist or has been moved."
      )
    ).toBeInTheDocument();

    // Check that the home button is displayed
    expect(screen.getByText("Go back home")).toBeInTheDocument();
  });

  it("navigates to home when 'Go back home' button is clicked", () => {
    render(<NotFound />);

    // Click the "Go back home" button
    fireEvent.click(screen.getByText("Go back home"));

    // Check that the router.push function was called with "/"
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("has the correct container styling", () => {
    const { container } = render(<NotFound />);

    // Check that the container has the correct styling
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass(
      "container",
      "flex",
      "items-center",
      "justify-center",
      "min-h-[70vh]"
    );
  });

  it("has the correct layout structure", () => {
    render(<NotFound />);

    // Check that the layout structure is correct
    const contentContainer = screen.getByText("404").parentElement;
    expect(contentContainer).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "text-center",
      "max-w-md"
    );
  });
});
