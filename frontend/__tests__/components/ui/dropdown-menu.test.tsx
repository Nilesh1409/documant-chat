import { render, screen, fireEvent } from "@testing-library/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

describe("DropdownMenu Component", () => {
  it("renders dropdown menu with trigger button", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(screen.getByText("Open Menu")).toBeInTheDocument()
  })

  it("opens dropdown when trigger is clicked", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    // Menu content should not be visible initially
    expect(screen.queryByText("Menu Label")).not.toBeInTheDocument()

    // Click to open menu
    fireEvent.click(screen.getByText("Open Menu"))

    // Menu content should be visible
    expect(screen.getByText("Menu Label")).toBeInTheDocument()
    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 2")).toBeInTheDocument()
  })

  it("renders checkbox items", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={true}>Checked Item</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>Unchecked Item</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    // Open menu
    fireEvent.click(screen.getByText("Open Menu"))

    // Check checkbox items
    expect(screen.getByText("Checked Item")).toBeInTheDocument()
    expect(screen.getByText("Unchecked Item")).toBeInTheDocument()
  })

  it("renders radio group with radio items", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option1">
            <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    // Open menu
    fireEvent.click(screen.getByText("Open Menu"))

    // Check radio items
    expect(screen.getByText("Option 1")).toBeInTheDocument()
    expect(screen.getByText("Option 2")).toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger className="custom-trigger">Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuLabel className="custom-label">Menu Label</DropdownMenuLabel>
          <DropdownMenuSeparator className="custom-separator" />
          <DropdownMenuGroup className="custom-group">
            <DropdownMenuItem className="custom-item">Item 1</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()
  })
})
