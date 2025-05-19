import { render, screen, fireEvent } from "@testing-library/react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

describe("HoverCard Component", () => {
  it("renders hover card with trigger", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Hover card content</HoverCardContent>
      </HoverCard>,
    )

    expect(screen.getByText("Hover me")).toBeInTheDocument()
  })

  it("shows hover card content on hover", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Hover card content</HoverCardContent>
      </HoverCard>,
    )

    // Hover card content should not be visible initially
    expect(screen.queryByText("Hover card content")).not.toBeInTheDocument()

    // Hover to show hover card
    fireEvent.mouseEnter(screen.getByText("Hover me"))

    // Hover card content should be visible
    expect(screen.getByText("Hover card content")).toBeInTheDocument()

    // Mouse leave to hide hover card
    fireEvent.mouseLeave(screen.getByText("Hover me"))

    // Hover card content should not be visible
    expect(screen.queryByText("Hover card content")).not.toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <HoverCard>
        <HoverCardTrigger className="custom-trigger">Hover me</HoverCardTrigger>
        <HoverCardContent className="custom-content">Hover card content</HoverCardContent>
      </HoverCard>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()

    // Hover to show hover card
    fireEvent.mouseEnter(screen.getByText("Hover me"))

    expect(document.querySelector(".custom-content")).toBeInTheDocument()
  })

  it("renders with side and align props", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent side="bottom" align="start">
          Hover card content
        </HoverCardContent>
      </HoverCard>,
    )

    // Hover to show hover card
    fireEvent.mouseEnter(screen.getByText("Hover me"))

    const hoverCardContent = screen.getByText("Hover card content")
    expect(hoverCardContent).toBeInTheDocument()
    expect(hoverCardContent.parentElement).toHaveAttribute("data-side", "bottom")
    expect(hoverCardContent.parentElement).toHaveAttribute("data-align", "start")
  })
})
