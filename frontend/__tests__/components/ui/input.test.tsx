"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { Input } from "@/components/ui/input"
import jest from "jest" // Importing jest to fix the undeclared variable error

describe("Input Component", () => {
  it("renders input element", () => {
    render(<Input />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("renders with placeholder", () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
  })

  it("renders with default value", () => {
    render(<Input defaultValue="Default text" />)
    expect(screen.getByDisplayValue("Default text")).toBeInTheDocument()
  })

  it("updates value when typed into", () => {
    render(<Input />)
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "New text" } })
    expect(input).toHaveValue("New text")
  })

  it("calls onChange handler when value changes", () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New text" } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it("applies disabled state", () => {
    render(<Input disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("applies readonly state", () => {
    render(<Input readOnly />)
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly")
  })

  it("applies custom className", () => {
    render(<Input className="custom-input" />)
    expect(screen.getByRole("textbox")).toHaveClass("custom-input")
  })

  it("renders with different types", () => {
    const { rerender } = render(<Input type="text" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text")

    rerender(<Input type="password" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "password")

    rerender(<Input type="email" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email")

    rerender(<Input type="number" />)
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number")
  })
})
