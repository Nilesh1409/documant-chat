"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { jest } from "@jest/globals"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

describe("Command Component", () => {
  it("renders command with input and items", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
            <CommandItem>
              Keyboard Shortcuts
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
    expect(screen.getByText("No results found.")).toBeInTheDocument()
    expect(screen.getByText("Suggestions")).toBeInTheDocument()
    expect(screen.getByText("Calendar")).toBeInTheDocument()
    expect(screen.getByText("Search")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument()
    expect(screen.getByText("⌘K")).toBeInTheDocument()
  })

  it("filters items when typing in input", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Items">
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
            <CommandItem>Cherry</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    const input = screen.getByPlaceholderText("Search...")

    // Type "a" to filter
    fireEvent.change(input, { target: { value: "a" } })

    // Should show Apple and Banana, but not Cherry
    expect(screen.getByText("Apple")).toBeInTheDocument()
    expect(screen.getByText("Banana")).toBeInTheDocument()
    expect(screen.queryByText("Cherry")).not.toBeVisible()

    // Type "ap" to filter further
    fireEvent.change(input, { target: { value: "ap" } })

    // Should only show Apple
    expect(screen.getByText("Apple")).toBeInTheDocument()
    expect(screen.queryByText("Banana")).not.toBeVisible()
    expect(screen.queryByText("Cherry")).not.toBeVisible()

    // Type "z" to show no results
    fireEvent.change(input, { target: { value: "z" } })

    // Should show empty state
    expect(screen.getByText("No results found.")).toBeVisible()
    expect(screen.queryByText("Apple")).not.toBeVisible()
    expect(screen.queryByText("Banana")).not.toBeVisible()
    expect(screen.queryByText("Cherry")).not.toBeVisible()
  })

  it("calls onSelect when item is clicked", () => {
    const handleSelect = jest.fn()
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem onSelect={handleSelect} value="apple">
              Apple
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    fireEvent.click(screen.getByText("Apple"))
    expect(handleSelect).toHaveBeenCalledWith("apple")
  })

  it("applies custom className to components", () => {
    render(
      <Command className="custom-command">
        <CommandInput className="custom-input" placeholder="Search..." />
        <CommandList className="custom-list">
          <CommandEmpty className="custom-empty">No results found.</CommandEmpty>
          <CommandGroup className="custom-group" heading="Group">
            <CommandItem className="custom-item">Item</CommandItem>
          </CommandGroup>
          <CommandSeparator className="custom-separator" />
          <CommandItem>
            Shortcut Item
            <CommandShortcut className="custom-shortcut">⌘K</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    )

    expect(document.querySelector(".custom-command")).toBeInTheDocument()
    expect(document.querySelector(".custom-input")).toBeInTheDocument()
    expect(document.querySelector(".custom-list")).toBeInTheDocument()
    expect(document.querySelector(".custom-empty")).toBeInTheDocument()
    expect(document.querySelector(".custom-group")).toBeInTheDocument()
    expect(document.querySelector(".custom-item")).toBeInTheDocument()
    expect(document.querySelector(".custom-separator")).toBeInTheDocument()
    expect(document.querySelector(".custom-shortcut")).toBeInTheDocument()
  })
})
