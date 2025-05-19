import { render, screen, fireEvent } from "@testing-library/react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

describe("Sheet Component", () => {
  it("renders sheet with trigger button", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Body</div>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.getByText("Open Sheet")).toBeInTheDocument()
  })

  it("opens sheet when trigger is clicked", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Body</div>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    )

    // Sheet content should not be visible initially
    expect(screen.queryByText("Sheet Title")).not.toBeInTheDocument()

    // Click to open sheet
    fireEvent.click(screen.getByText("Open Sheet"))

    // Sheet content should be visible
    expect(screen.getByText("Sheet Title")).toBeInTheDocument()
    expect(screen.getByText("Sheet Description")).toBeInTheDocument()
    expect(screen.getByText("Sheet Body")).toBeInTheDocument()
    expect(screen.getByText("Close")).toBeInTheDocument()
  })

  it("closes sheet when close button is clicked", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    )

    // Open sheet
    fireEvent.click(screen.getByText("Open Sheet"))
    expect(screen.getByText("Sheet Title")).toBeInTheDocument()

    // Close sheet
    fireEvent.click(screen.getByText("Close"))

    // Sheet content should not be visible
    expect(screen.queryByText("Sheet Title")).not.toBeInTheDocument()
  })

  it("renders with different side positions", () => {
    const { rerender } = render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent side="right">Content</SheetContent>
      </Sheet>,
    )

    // Open sheet
    fireEvent.click(screen.getByText("Open Sheet"))
    expect(screen.getByText("Content")).toBeInTheDocument()
    expect(document.querySelector("[data-state=open]")).toHaveClass("right-0")

    // Close sheet
    fireEvent.click(screen.getByRole("button", { name: "Close" }))

    // Rerender with different side
    rerender(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent side="left">Content</SheetContent>
      </Sheet>,
    )

    // Open sheet again
    fireEvent.click(screen.getByText("Open Sheet"))
    expect(document.querySelector("[data-state=open]")).toHaveClass("left-0")
  })

  it("applies custom className to components", () => {
    render(
      <Sheet>
        <SheetTrigger className="custom-trigger">Open Sheet</SheetTrigger>
        <SheetContent className="custom-content">
          <SheetHeader className="custom-header">
            <SheetTitle className="custom-title">Sheet Title</SheetTitle>
            <SheetDescription className="custom-description">Sheet Description</SheetDescription>
          </SheetHeader>
          <SheetFooter className="custom-footer">
            <SheetClose className="custom-close">Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()
  })
})
