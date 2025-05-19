import { render, screen } from "@testing-library/react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

describe("Pagination Component", () => {
  it("renders pagination with items", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(screen.getByText("Previous")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("Next")).toBeInTheDocument()
  })

  it("applies active state to current page", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    const activeLink = screen.getByText("2")
    expect(activeLink).toHaveAttribute("aria-current", "page")
  })

  it("applies custom className to components", () => {
    render(
      <Pagination className="custom-pagination">
        <PaginationContent className="custom-content">
          <PaginationItem className="custom-item">
            <PaginationLink href="#" className="custom-link">
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious href="#" className="custom-previous" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" className="custom-next" />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis className="custom-ellipsis" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(document.querySelector(".custom-pagination")).toBeInTheDocument()
    expect(document.querySelector(".custom-content")).toBeInTheDocument()
    expect(document.querySelector(".custom-item")).toBeInTheDocument()
    expect(document.querySelector(".custom-link")).toBeInTheDocument()
    expect(document.querySelector(".custom-previous")).toBeInTheDocument()
    expect(document.querySelector(".custom-next")).toBeInTheDocument()
    expect(document.querySelector(".custom-ellipsis")).toBeInTheDocument()
  })
})
