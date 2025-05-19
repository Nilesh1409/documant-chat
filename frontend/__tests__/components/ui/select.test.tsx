import { render, screen, fireEvent } from "@testing-library/react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select"

describe("Select Component", () => {
  it("renders select with trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>,
    )

    expect(screen.getByText("Select an option")).toBeInTheDocument()
  })

  it("opens select when trigger is clicked", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>,
    )

    // Select content should not be visible initially
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument()

    // Click to open select
    fireEvent.click(screen.getByText("Select an option"))

    // Select content should be visible
    expect(screen.getByText("Option 1")).toBeInTheDocument()
    expect(screen.getByText("Option 2")).toBeInTheDocument()
  })

  it("renders with groups and labels", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Group 2</SelectLabel>
            <SelectItem value="option3">Option 3</SelectItem>
            <SelectItem value="option4">Option 4</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    )

    // Click to open select
    fireEvent.click(screen.getByText("Select an option"))

    // Check groups and labels
    expect(screen.getByText("Group 1")).toBeInTheDocument()
    expect(screen.getByText("Group 2")).toBeInTheDocument()
    expect(screen.getByText("Option 1")).toBeInTheDocument()
    expect(screen.getByText("Option 2")).toBeInTheDocument()
    expect(screen.getByText("Option 3")).toBeInTheDocument()
    expect(screen.getByText("Option 4")).toBeInTheDocument()
  })

  it("applies custom className to components", () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Select an option" className="custom-value" />
        </SelectTrigger>
        <SelectContent className="custom-content">
          <SelectGroup className="custom-group">
            <SelectLabel className="custom-label">Group 1</SelectLabel>
            <SelectItem value="option1" className="custom-item">
              Option 1
            </SelectItem>
          </SelectGroup>
          <SelectSeparator className="custom-separator" />
        </SelectContent>
      </Select>,
    )

    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()
    expect(document.querySelector(".custom-value")).toBeInTheDocument()
  })
})
