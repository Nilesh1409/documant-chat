import { render, screen } from "@testing-library/react"
import { Badge } from "@/components/ui/badge"

describe("Badge Component", () => {
  it("renders badge with text", () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText("New")).toBeInTheDocument()
  })

  it("renders different variants", () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText("Default")).toHaveClass("bg-primary")

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText("Secondary")).toHaveClass("bg-secondary")

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText("Destructive")).toHaveClass("bg-destructive")

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText("Outline")).toHaveClass("border")
  })

  it("applies custom className", () => {
    render(<Badge className="custom-badge">Badge</Badge>)
    expect(screen.getByText("Badge")).toHaveClass("custom-badge")
  })

  it("renders as link when href is provided", () => {
    render(<Badge href="/path">Link Badge</Badge>)
    const linkBadge = screen.getByText("Link Badge")
    expect(linkBadge.tagName).toBe("A")
    expect(linkBadge).toHaveAttribute("href", "/path")
  })

  it("renders with additional props", () => {
    render(<Badge data-testid="test-badge">Badge</Badge>)
    expect(screen.getByTestId("test-badge")).toBeInTheDocument()
  })
})
