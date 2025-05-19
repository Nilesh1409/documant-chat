"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
  })

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole("button", { name: "Click me" }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("renders different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByRole("button", { name: "Default" })).toHaveClass("bg-primary")

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole("button", { name: "Destructive" })).toHaveClass("bg-destructive")

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole("button", { name: "Outline" })).toHaveClass("border")

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass("bg-secondary")

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole("button", { name: "Ghost" })).toHaveClass("hover:bg-accent")

    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByRole("button", { name: "Link" })).toHaveClass("text-primary")
  })

  it("renders different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>)
    expect(screen.getByRole("button", { name: "Default" })).toHaveClass("h-10 px-4 py-2")

    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass("h-9 px-3")

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole("button", { name: "Large" })).toHaveClass("h-11 px-8")

    rerender(<Button size="icon">Icon</Button>)
    expect(screen.getByRole("button", { name: "Icon" })).toHaveClass("h-10 w-10")
  })

  it("applies disabled state", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<Button className="custom-button">Custom</Button>)
    expect(screen.getByRole("button", { name: "Custom" })).toHaveClass("custom-button")
  })
})
