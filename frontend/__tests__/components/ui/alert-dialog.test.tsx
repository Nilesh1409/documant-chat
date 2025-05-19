import { render, screen, fireEvent } from "@testing-library/react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

describe("AlertDialog Component", () => {
  it("renders alert dialog with trigger button", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open Alert</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert Title</AlertDialogTitle>
            <AlertDialogDescription>Alert Description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    expect(screen.getByText("Open Alert")).toBeInTheDocument()
  })

  it("opens dialog when trigger is clicked", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open Alert</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert Title</AlertDialogTitle>
            <AlertDialogDescription>Alert Description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    // Dialog content should not be visible initially
    expect(screen.queryByText("Alert Title")).not.toBeInTheDocument()

    // Click to open dialog
    fireEvent.click(screen.getByText("Open Alert"))

    // Dialog content should be visible
    expect(screen.getByText("Alert Title")).toBeInTheDocument()
    expect(screen.getByText("Alert Description")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
    expect(screen.getByText("Continue")).toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger className="custom-trigger">Open Alert</AlertDialogTrigger>
        <AlertDialogContent className="custom-content">
          <AlertDialogHeader className="custom-header">
            <AlertDialogTitle className="custom-title">Alert Title</AlertDialogTitle>
            <AlertDialogDescription className="custom-description">Alert Description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="custom-footer">
            <AlertDialogCancel className="custom-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction className="custom-action">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()
  })
})
