import { render, screen, fireEvent } from "@testing-library/react"
import { Checkbox } from "@/components/ui/checkbox"
import { jest } from "@jest/globals"

describe("Checkbox Component", () => {
  it("renders checkbox", () => {
    render(<Checkbox />)
    expect(screen.getByRole("checkbox")).toBeInTheDocument()
  })

  it("renders with label when used with label element", () => {
    render(
      <div>
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms</label>
      </div>,
    )

    expect(screen.getByLabelText("Accept terms")).toBeInTheDocument()
  })

  it("toggles checked state when clicked", () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole("checkbox")

    // Should be unchecked initially
    expect(checkbox).not.toBeChecked()

    // Click to check
    fireEvent.click(checkbox)
    expect(checkbox).toHaveAttribute("data-state", "checked")

    // Click to uncheck
    fireEvent.click(checkbox)
    expect(checkbox).toHaveAttribute("data-state", "unchecked")
  })

  it("calls onCheckedChange handler when clicked", () => {
    const handleCheckedChange = jest.fn()
    render(<Checkbox onCheckedChange={handleCheckedChange} />)

    fireEvent.click(screen.getByRole("checkbox"))
    expect(handleCheckedChange).toHaveBeenCalledTimes(1)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole("checkbox"))
    expect(handleCheckedChange).toHaveBeenCalledTimes(2)
    expect(handleCheckedChange).toHaveBeenCalledWith(false)
  })

  it("applies disabled state", () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole("checkbox")).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<Checkbox className="custom-checkbox" />)
    expect(screen.getByRole("checkbox")).toHaveClass("custom-checkbox")
  })
})
