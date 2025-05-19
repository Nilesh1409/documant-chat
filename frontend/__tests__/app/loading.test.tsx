import { render, screen } from "@testing-library/react";
import Loading from "@/app/loading";

describe("Loading Component", () => {
  it("renders the loading spinner", () => {
    render(<Loading />);

    // Check that the loading spinner is displayed
    const loadingSpinner = screen.getByTestId("loading-spinner");
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass("animate-spin");
  });

  it("displays the loading text", () => {
    render(<Loading />);

    // Check that the loading text is displayed
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("has the correct container styling", () => {
    const { container } = render(<Loading />);

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
    render(<Loading />);

    // Check that the layout structure is correct
    const flexContainer = screen.getByText("Loading...").parentElement;
    expect(flexContainer).toHaveClass("flex", "flex-col", "items-center");
  });
});
