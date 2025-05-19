import { render } from "@testing-library/react"
import { Separator } from "@/components/ui/separator"

describe("Separator Component", () => {
  it("renders horizontal separator by default", () => {
    const { container } = render(<Separator />)
    const separator = container.firstChild

    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass("h-[1px] w-full")
  })

  it("renders vertical separator", () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.firstChild

    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass("h-full w-[1px]")
  })

  it("applies custom className", () => {
    const { container } = render(<Separator className="custom-separator" />)
    const separator = container.firstChild

    expect(separator).toHaveClass("custom-separator")
  })

  it("renders with decorative role by default", () => {
    const { container } = render(<Separator />)
    const separator = container.firstChild

    expect(separator).toHaveAttribute("role", "none")
  })

  it("renders with separator role when not decorative", () => {
    const { container } = render(<Separator decorative={false} />)
    const separator = container.firstChild

    expect(separator).toHaveAttribute("role", "separator")
  })
})
