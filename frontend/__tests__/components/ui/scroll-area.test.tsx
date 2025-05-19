import { render, screen } from "@testing-library/react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

describe("ScrollArea Component", () => {
  it("renders scroll area with content", () => {
    render(
      <ScrollArea className="h-[200px] w-[350px]">
        <div style={{ height: "500px", width: "500px" }}>Scroll content</div>
      </ScrollArea>,
    )

    expect(screen.getByText("Scroll content")).toBeInTheDocument()
  })

  it("renders with vertical scrollbar by default", () => {
    const { container } = render(
      <ScrollArea className="h-[200px] w-[350px]">
        <div style={{ height: "500px", width: "500px" }}>Scroll content</div>
      </ScrollArea>,
    )

    // Check for the presence of the scrollbar
    const scrollbar = container.querySelector('[data-orientation="vertical"]')
    expect(scrollbar).toBeInTheDocument()
  })

  it("renders with horizontal scrollbar", () => {
    const { container } = render(
      <ScrollArea className="h-[200px] w-[350px]">
        <div style={{ height: "500px", width: "500px" }}>Scroll content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    )

    // Check for the presence of the horizontal scrollbar
    const scrollbar = container.querySelector('[data-orientation="horizontal"]')
    expect(scrollbar).toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    const { container } = render(
      <ScrollArea className="custom-scroll-area">
        <div>Scroll content</div>
        <ScrollBar className="custom-scrollbar" />
      </ScrollArea>,
    )

    expect(container.querySelector(".custom-scroll-area")).toBeInTheDocument()
    expect(container.querySelector(".custom-scrollbar")).toBeInTheDocument()
  })

  it("renders with type prop", () => {
    const { container } = render(
      <ScrollArea type="always" className="h-[200px] w-[350px]">
        <div style={{ height: "500px", width: "500px" }}>Scroll content</div>
      </ScrollArea>,
    )

    // The scrollbar should be visible even without scrolling
    const scrollbar = container.querySelector('[data-orientation="vertical"]')
    expect(scrollbar).toBeInTheDocument()
    expect(scrollbar).toHaveAttribute("data-state", "visible")
  })
})
