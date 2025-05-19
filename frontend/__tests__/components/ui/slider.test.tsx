"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { Slider } from "@/components/ui/slider"
import jest from "jest" // Importing jest to fix the undeclared variable error

describe("Slider Component", () => {
  it("renders slider", () => {
    render(<Slider defaultValue={[50]} />)
    expect(screen.getByRole("slider")).toBeInTheDocument()
  })

  it("sets correct aria values", () => {
    render(<Slider defaultValue={[50]} min={0} max={100} step={1} />)
    const slider = screen.getByRole("slider")

    expect(slider).toHaveAttribute("aria-valuemin", "0")
    expect(slider).toHaveAttribute("aria-valuemax", "100")
    expect(slider).toHaveAttribute("aria-valuenow", "50")
  })

  it("renders with multiple thumbs", () => {
    render(<Slider defaultValue={[25, 75]} />)
    const sliders = screen.getAllByRole("slider")

    expect(sliders).toHaveLength(2)
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "25")
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "75")
  })

  it("applies disabled state", () => {
    render(<Slider defaultValue={[50]} disabled />)
    expect(screen.getByRole("slider")).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<Slider defaultValue={[50]} className="custom-slider" />)
    expect(screen.getByRole("group")).toHaveClass("custom-slider")
  })

  it("calls onValueChange handler when value changes", () => {
    const handleValueChange = jest.fn()
    render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />)

    // This is a simplified test as actually simulating slider movement is complex
    // We're just testing that the handler is attached
    const slider = screen.getByRole("slider")
    fireEvent.keyDown(slider, { key: "ArrowRight" })

    expect(handleValueChange).toHaveBeenCalled()
  })
})
