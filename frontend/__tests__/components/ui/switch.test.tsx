import { render, screen, fireEvent } from "@testing-library/react"
import { Switch } from "@/components/ui/switch"
import { jest } from "@jest/globals"

describe("Switch Component", () => {
  it("renders switch", () => {
    render(<Switch />)
    expect(screen.getByRole("switch")).toBeInTheDocument()
  })

  it("renders with label when used with label element", () => {
    render(
      <div>
        <Switch id="airplane-mode" />
        <label htmlFor="airplane-mode">Airplane Mode</label>
      </div>,
    )

    expect(screen.getByLabelText("Airplane Mode")).toBeInTheDocument()
  })

  it("toggles checked state when clicked", () => {
    render(<Switch />)
    const switchElement = screen.getByRole("switch")

    // Should be unchecked initially
    expect(switchElement).toHaveAttribute("aria-checked", "false")

    // Click to check
    fireEvent.click(switchElement)
    expect(switchElement).toHaveAttribute("aria-checked", "true")

    // Click to uncheck
    fireEvent.click(switchElement)
    expect(switchElement).toHaveAttribute("aria-checked", "false")
  })

  it("calls onCheckedChange handler when clicked", () => {
    const handleCheckedChange = jest.fn()
    render(<Switch onCheckedChange={handleCheckedChange} />)

    fireEvent.click(screen.getByRole("switch"))
    expect(handleCheckedChange).toHaveBeenCalledTimes(1)
    expect(handleCheckedChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole("switch"))
    expect(handleCheckedChange).toHaveBeenCalledTimes(2)
    expect(handleCheckedChange).toHaveBeenCalledWith(false)
  })

  it("applies disabled state", () => {
    render(<Switch disabled />)
    expect(screen.getByRole("switch")).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<Switch className="custom-switch" />)
    expect(screen.getByRole("switch")).toHaveClass("custom-switch")
  })
})
