import { render, screen, fireEvent } from "@testing-library/react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

describe("Tooltip Component", () => {
  it("renders tooltip with trigger", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(screen.getByText("Hover me")).toBeInTheDocument()
  })

  it("shows tooltip content on hover", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    // Tooltip content should not be visible initially
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument()

    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByText("Hover me"))

    // Tooltip content should be visible
    expect(screen.getByText("Tooltip content")).toBeInTheDocument()

    // Mouse leave to hide tooltip
    fireEvent.mouseLeave(screen.getByText("Hover me"))

    // Tooltip content should not be visible
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="custom-trigger">Hover me</TooltipTrigger>
          <TooltipContent className="custom-content">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()

    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByText("Hover me"))

    expect(document.querySelector(".custom-content")).toBeInTheDocument()
  })

  it("renders with side and align props", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    // Hover to show tooltip
    fireEvent.mouseEnter(screen.getByText("Hover me"))

    const tooltipContent = screen.getByText("Tooltip content")
    expect(tooltipContent).toBeInTheDocument()
    expect(tooltipContent.parentElement).toHaveAttribute("data-side", "bottom")
    expect(tooltipContent.parentElement).toHaveAttribute("data-align", "start")
  })
})
