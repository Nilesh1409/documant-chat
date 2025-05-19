import { render, screen, fireEvent } from "@testing-library/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { jest } from "@jest/globals"

describe("Avatar Component", () => {
  it("renders avatar with image", () => {
    render(
      <Avatar>
        <AvatarImage src="/placeholder.svg" alt="Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )

    expect(screen.getByAltText("Avatar")).toBeInTheDocument()
    expect(screen.getByAltText("Avatar")).toHaveAttribute("src", "/placeholder.svg")
  })

  it("renders fallback when image fails to load", () => {
    render(
      <Avatar>
        <AvatarImage src="/non-existent-image.jpg" alt="Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )

    // Simulate image load error
    const img = screen.getByAltText("Avatar")
    fireEvent.error(img)

    expect(screen.getByText("JD")).toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarImage className="custom-image" src="/placeholder.svg" alt="Avatar" />
        <AvatarFallback className="custom-fallback">JD</AvatarFallback>
      </Avatar>,
    )

    expect(document.querySelector(".custom-avatar")).toBeInTheDocument()
    expect(document.querySelector(".custom-image")).toBeInTheDocument()
    expect(document.querySelector(".custom-fallback")).toBeInTheDocument()
  })

  it("renders with delayMs prop", () => {
    jest.useFakeTimers()

    render(
      <Avatar>
        <AvatarImage src="/non-existent-image.jpg" alt="Avatar" />
        <AvatarFallback delayMs={500}>JD</AvatarFallback>
      </Avatar>,
    )

    // Fallback should not be visible immediately
    expect(screen.queryByText("JD")).not.toBeVisible()

    // Advance timers
    jest.advanceTimersByTime(600)

    // Fallback should be visible after delay
    expect(screen.getByText("JD")).toBeVisible()

    jest.useRealTimers()
  })
})
