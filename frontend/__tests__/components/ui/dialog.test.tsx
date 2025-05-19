import { render, screen, fireEvent } from "@testing-library/react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

describe("Dialog Component", () => {
  it("renders dialog with trigger button", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Body</div>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByText("Open Dialog")).toBeInTheDocument()
  })

  it("opens dialog when trigger is clicked", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Body</div>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )

    // Dialog content should not be visible initially
    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument()

    // Click to open dialog
    fireEvent.click(screen.getByText("Open Dialog"))

    // Dialog content should be visible
    expect(screen.getByText("Dialog Title")).toBeInTheDocument()
    expect(screen.getByText("Dialog Description")).toBeInTheDocument()
    expect(screen.getByText("Dialog Body")).toBeInTheDocument()
    expect(screen.getByText("Close")).toBeInTheDocument()
  })

  it("closes dialog when close button is clicked", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )

    // Open dialog
    fireEvent.click(screen.getByText("Open Dialog"))
    expect(screen.getByText("Dialog Title")).toBeInTheDocument()

    // Close dialog
    fireEvent.click(screen.getByText("Close"))

    // Dialog content should not be visible
    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <Dialog>
        <DialogTrigger className="custom-trigger">Open Dialog</DialogTrigger>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Dialog Title</DialogTitle>
            <DialogDescription className="custom-description">Dialog Description</DialogDescription>
          </DialogHeader>
          <DialogFooter className="custom-footer">
            <DialogClose className="custom-close">Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()
  })
})
