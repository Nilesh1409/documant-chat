import { render, screen, fireEvent } from "@testing-library/react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

describe("Accordion Component", () => {
  it("renders accordion with items", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Item 1</AccordionTrigger>
          <AccordionContent>Content for accordion item 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Accordion Item 2</AccordionTrigger>
          <AccordionContent>Content for accordion item 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(screen.getByText("Accordion Item 1")).toBeInTheDocument()
    expect(screen.getByText("Accordion Item 2")).toBeInTheDocument()
  })

  it("expands and collapses when clicked", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Item 1</AccordionTrigger>
          <AccordionContent>Content for accordion item 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    // Content should be hidden initially
    expect(screen.queryByText("Content for accordion item 1")).not.toBeVisible()

    // Click to expand
    fireEvent.click(screen.getByText("Accordion Item 1"))

    // Content should be visible
    expect(screen.getByText("Content for accordion item 1")).toBeVisible()

    // Click to collapse
    fireEvent.click(screen.getByText("Accordion Item 1"))

    // Content should be hidden again
    expect(screen.queryByText("Content for accordion item 1")).not.toBeVisible()
  })

  it("applies custom className to components", () => {
    render(
      <Accordion type="single" collapsible className="custom-accordion">
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger className="custom-trigger">Accordion Item 1</AccordionTrigger>
          <AccordionContent className="custom-content">Content for accordion item 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(document.querySelector(".custom-accordion")).toBeInTheDocument()
    expect(document.querySelector(".custom-item")).toBeInTheDocument()
    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()
    expect(document.querySelector(".custom-content")).toBeInTheDocument()
  })
})
