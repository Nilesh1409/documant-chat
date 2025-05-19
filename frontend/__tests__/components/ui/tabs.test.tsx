import { render, screen, fireEvent } from "@testing-library/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

describe("Tabs Component", () => {
  it("renders tabs with content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>,
    )

    expect(screen.getByText("Tab 1")).toBeInTheDocument()
    expect(screen.getByText("Tab 2")).toBeInTheDocument()
    expect(screen.getByText("Tab 1 Content")).toBeInTheDocument()
    expect(screen.queryByText("Tab 2 Content")).not.toBeVisible()
  })

  it("switches tabs when clicked", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>,
    )

    // Tab 1 should be active initially
    expect(screen.getByText("Tab 1 Content")).toBeVisible()
    expect(screen.queryByText("Tab 2 Content")).not.toBeVisible()

    // Click Tab 2
    fireEvent.click(screen.getByText("Tab 2"))

    // Tab 2 should be active now
    expect(screen.queryByText("Tab 1 Content")).not.toBeVisible()
    expect(screen.getByText("Tab 2 Content")).toBeVisible()
  })

  it("applies active state to current tab", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>,
    )

    const tab1 = screen.getByText("Tab 1")
    const tab2 = screen.getByText("Tab 2")

    expect(tab1).toHaveAttribute("data-state", "active")
    expect(tab2).toHaveAttribute("data-state", "inactive")

    // Click Tab 2
    fireEvent.click(tab2)

    expect(tab1).toHaveAttribute("data-state", "inactive")
    expect(tab2).toHaveAttribute("data-state", "active")
  })

  it("applies custom className to components", () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Tab 1 Content
        </TabsContent>
      </Tabs>,
    )

    expect(document.querySelector(".custom-tabs")).toBeInTheDocument()
    expect(document.querySelector(".custom-list")).toBeInTheDocument()
    expect(document.querySelector(".custom-trigger")).toBeInTheDocument()
    expect(document.querySelector(".custom-content")).toBeInTheDocument()
  })
})
