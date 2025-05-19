import { render, screen } from "@testing-library/react"
import { Label } from "@/components/ui/label"

describe("Label Component", () => {
  it("renders label with text", () => {
    render(<Label>Label Text</Label>)
    expect(screen.getByText("Label Text")).toBeInTheDocument()
  })

  it("renders with htmlFor attribute", () => {
    render(<Label htmlFor="input-id">Label Text</Label>)
    expect(screen.getByText("Label Text")).toHaveAttribute("for", "input-id")
  })

  it("applies custom className", () => {
    render(<Label className="custom-label">Label Text</Label>)
    expect(screen.getByText("Label Text")).toHaveClass("custom-label")
  })

  it("works with form controls", () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </>,
    )

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument()
  })

  it("renders with additional props", () => {
    render(<Label data-testid="test-label">Label Text</Label>)
    expect(screen.getByTestId("test-label")).toBeInTheDocument()
  })
})
