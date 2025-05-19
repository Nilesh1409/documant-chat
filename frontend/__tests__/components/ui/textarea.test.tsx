"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { Textarea } from "@/components/ui/textarea"
import { jest } from "@jest/globals"

describe("Textarea Component", () => {
  it("renders textarea element", () => {
    render(<Textarea />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("renders with placeholder", () => {
    render(<Textarea placeholder="Enter text" />)
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
  })

  it("renders with default value", () => {
    render(<Textarea defaultValue="Default text" />)
    expect(screen.getByDisplayValue("Default text")).toBeInTheDocument()
  })

  it("updates value when typed into", () => {
    render(<Textarea />)
    const textarea = screen.getByRole("textbox")

    fireEvent.change(textarea, { target: { value: "New text" } })
    expect(textarea).toHaveValue("New text")
  })

  it("calls onChange handler when value changes", () => {
    const handleChange = jest.fn()
    render(<Textarea onChange={handleChange} />)

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New text" } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it("applies disabled state", () => {
    render(<Textarea disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("applies readonly state", () => {
    render(<Textarea readOnly />)
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly")
  })

  it("applies custom className", () => {
    render(<Textarea className="custom-textarea" />)
    expect(screen.getByRole("textbox")).toHaveClass("custom-textarea")
  })

  it("applies rows attribute", () => {
    render(<Textarea rows={5} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5")
  })
})
