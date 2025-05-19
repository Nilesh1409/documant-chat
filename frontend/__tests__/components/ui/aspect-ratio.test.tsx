import { render } from "@testing-library/react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

describe("AspectRatio Component", () => {
  it("renders with children", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div data-testid="child">Content</div>
      </AspectRatio>,
    )

    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9} className="custom-aspect-ratio">
        <div>Content</div>
      </AspectRatio>,
    )

    expect(container.firstChild).toHaveClass("custom-aspect-ratio")
  })

  it("applies the correct ratio", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>,
    )

    // The AspectRatio component should have a style with paddingBottom set to the inverse of the ratio
    expect(container.firstChild).toHaveStyle("--aspect-ratio: 0.5625") // 9/16 = 0.5625
  })
})
