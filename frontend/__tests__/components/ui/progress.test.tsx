import { render, screen } from "@testing-library/react"
import { Progress } from "@/components/ui/progress"

describe("Progress Component", () => {
  it("renders progress bar", () => {
    render(<Progress value={50} />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("sets correct aria values", () => {
    render(<Progress value={50} />)
    const progressbar = screen.getByRole("progressbar")

    expect(progressbar).toHaveAttribute("aria-valuemin", "0")
    expect(progressbar).toHaveAttribute("aria-valuemax", "100")
    expect(progressbar).toHaveAttribute("aria-valuenow", "50")
  })

  it("renders with 0 value", () => {
    render(<Progress value={0} />)
    const progressbar = screen.getByRole("progressbar")

    expect(progressbar).toHaveAttribute("aria-valuenow", "0")
  })

  it("renders with 100 value", () => {
    render(<Progress value={100} />)
    const progressbar = screen.getByRole("progressbar")

    expect(progressbar).toHaveAttribute("aria-valuenow", "100")
  })

  it("applies custom className", () => {
    render(<Progress value={50} className="custom-progress" />)
    expect(screen.getByRole("progressbar")).toHaveClass("custom-progress")
  })

  it("renders without value", () => {
    render(<Progress />)
    const progressbar = screen.getByRole("progressbar")

    expect(progressbar).not.toHaveAttribute("aria-valuenow")
  })
})
