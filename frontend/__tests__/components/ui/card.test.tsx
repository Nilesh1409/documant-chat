import { render, screen } from "@testing-library/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

describe("Card Component", () => {
  it("renders card with all subcomponents", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByText("Card Title")).toBeInTheDocument()
    expect(screen.getByText("Card Description")).toBeInTheDocument()
    expect(screen.getByText("Card Content")).toBeInTheDocument()
    expect(screen.getByText("Card Footer")).toBeInTheDocument()
  })

  it("applies custom className to all subcomponents", () => {
    render(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">Card Title</CardTitle>
          <CardDescription className="custom-description">Card Description</CardDescription>
        </CardHeader>
        <CardContent className="custom-content">Card Content</CardContent>
        <CardFooter className="custom-footer">Card Footer</CardFooter>
      </Card>,
    )

    expect(document.querySelector(".custom-card")).toBeInTheDocument()
    expect(document.querySelector(".custom-header")).toBeInTheDocument()
    expect(document.querySelector(".custom-title")).toBeInTheDocument()
    expect(document.querySelector(".custom-description")).toBeInTheDocument()
    expect(document.querySelector(".custom-content")).toBeInTheDocument()
    expect(document.querySelector(".custom-footer")).toBeInTheDocument()
  })

  it("renders card with minimal content", () => {
    render(
      <Card>
        <CardContent>Minimal Card</CardContent>
      </Card>,
    )

    expect(screen.getByText("Minimal Card")).toBeInTheDocument()
  })
})
