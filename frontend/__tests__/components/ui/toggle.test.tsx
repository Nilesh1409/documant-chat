import { render, screen, fireEvent } from "@testing-library/react"
import { Toggle } from "@/components/ui/toggle"
import { jest } from "@jest/globals"

describe("Toggle Component", () => {
  it("renders toggle button", () => {
    render(<Toggle>Toggle</Toggle>)
    expect(screen.getByRole("button", { name: "Toggle" })).toBeInTheDocument()
  })

  it("toggles pressed state when clicked", () => {
    render(<Toggle>Toggle</Toggle>)
    const toggle = screen.getByRole("button", { name: "Toggle" })

    // Should be unpressed initially
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    // Click to press
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "true")

    // Click to unpress
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "false")
  })

  it("calls onPressedChange handler when clicked", () => {
    const handlePressedChange = jest.fn()
    render(<Toggle onPressedChange={handlePressedChange}>Toggle</Toggle>)

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }))
    expect(handlePressedChange).toHaveBeenCalledTimes(1)
    expect(handlePressedChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }))
    expect(handlePressedChange).toHaveBeenCalledTimes(2)
    expect(handlePressedChange).toHaveBeenCalledWith(false)
  })

  it("renders with default pressed state", () => {
    render(<Toggle pressed>Toggle</Toggle>)
    expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute("aria-pressed", "true")
  })

  it("applies disabled state", () => {
    render(<Toggle disabled>Toggle</Toggle>)
    expect(screen.getByRole("button", { name: "Toggle" })).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<Toggle className="custom-toggle">Toggle</Toggle>)
    expect(screen.getByRole("button", { name: "Toggle" })).toHaveClass("custom-toggle")
  })

  it("renders different variants", () => {
    const { rerender } = render(<Toggle variant="default">Default</Toggle>)
    expect(screen.getByRole("button", { name: "Default" })).toHaveClass("bg-transparent")

    rerender(<Toggle variant="outline">Outline</Toggle>)
    expect(screen.getByRole("button", { name: "Outline" })).toHaveClass("border")
  })

  it("renders different sizes", () => {
    const { rerender } = render(<Toggle size="default">Default</Toggle>)
    expect(screen.getByRole("button", { name: "Default" })).toHaveClass("h-10")

    rerender(<Toggle size="sm">Small</Toggle>)
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass("h-9")

    rerender(<Toggle size="lg">Large</Toggle>)
    expect(screen.getByRole("button", { name: "Large" })).toHaveClass("h-11")
  })
})
