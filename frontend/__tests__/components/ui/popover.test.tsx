import { render, screen, fireEvent } from "@testing-library/react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

describe("Popover Component", () => {
  it("renders popover with trigger", () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    )

    expect(screen.getByText("Open Popover")).toBeInTheDocument()
  })

  it("opens popover when trigger is clicked", () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    )

    // Popover content should not be visible initially
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument()

    // Click to open popover
    fireEvent.click(screen.getByText("Open Popover"))

    // Popover content should be visible
    expect(screen.getByText("Popover content")).toBeInTheDocument()

    // Click again to close popover
    fireEvent.click(screen.getByText("Open Popover"))

    // Popover content should not be visible
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <Popover>
        <PopoverTrigger className="custom-trigger">Open Popover</PopoverTrigger>
        <PopoverContent className="custom-content">Popover content</PopoverContent>
      </Popover>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()

    // Click to open popover
    fireEvent.click(screen.getByText("Open Popover"))

    expect(document.querySelector(".custom-content")).toBeInTheDocument()
  })

  it("renders with side and align props", () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent side="bottom" align="start">
          Popover content
        </PopoverContent>
      </Popover>,
    )

    // Click to open popover
    fireEvent.click(screen.getByText("Open Popover"))

    const popoverContent = screen.getByText("Popover content")
    expect(popoverContent).toBeInTheDocument()
    expect(popoverContent.parentElement).toHaveAttribute("data-side", "bottom")
    expect(popoverContent.parentElement).toHaveAttribute("data-align", "start")
  })
})
