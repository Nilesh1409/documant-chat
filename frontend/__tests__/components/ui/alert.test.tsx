// __tests__/alert.test.tsx
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Mock cn to just concatenate class names for snapshot consistency
jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("Alert component", () => {
  it("renders with role='alert'", () => {
    render(<Alert>Test message</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Test message");
  });

  it("applies default variant classes", () => {
    render(<Alert>Default variant</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-background", "text-foreground");
  });

  it("applies destructive variant classes", () => {
    render(<Alert variant="destructive">Oops!</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-destructive/50", "text-destructive");
  });

  it("forwards ref to the div element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Alert ref={ref}>Ref test</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "alert");
  });

  it("merges custom className", () => {
    render(
      <Alert className="custom-class" data-testid="the-alert">
        Hello
      </Alert>
    );
    const alert = screen.getByTestId("the-alert");
    expect(alert).toHaveClass("custom-class");
  });

  it("spreads other props", () => {
    render(
      <Alert id="foo" aria-label="bar">
        Props
      </Alert>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("id", "foo");
    expect(alert).toHaveAttribute("aria-label", "bar");
  });
});

describe("AlertTitle component", () => {
  it("renders as an h5 with correct base classes", () => {
    render(<AlertTitle data-testid="title">My Title</AlertTitle>);
    const title = screen.getByTestId("title");
    expect(title.tagName).toBe("H5");
    expect(title).toHaveClass(
      "mb-1",
      "font-medium",
      "leading-none",
      "tracking-tight"
    );
    expect(title).toHaveTextContent("My Title");
  });

  it("forwards ref to the h5 element", () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(
      <AlertTitle ref={ref} data-testid="title-ref">
        Ref Title
      </AlertTitle>
    );
    const title = screen.getByTestId("title-ref");
    expect(ref.current).toBe(title);
  });

  it("merges custom className and props", () => {
    render(
      <AlertTitle className="foo" id="bar">
        Test
      </AlertTitle>
    );
    const title = screen.getByText("Test");
    expect(title).toHaveClass("foo");
    expect(title).toHaveAttribute("id", "bar");
  });
});

describe("AlertDescription component", () => {
  it("renders as a div with correct base classes", () => {
    render(
      <AlertDescription data-testid="desc">
        <p>Line1</p>
      </AlertDescription>
    );
    const desc = screen.getByTestId("desc");
    expect(desc.tagName).toBe("DIV");
    expect(desc).toHaveClass("text-sm");
    // ensure nested <p> is rendered
    expect(desc.querySelector("p")).toHaveTextContent("Line1");
  });

  it("forwards ref to the div element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <AlertDescription ref={ref} data-testid="desc-ref">
        Content
      </AlertDescription>
    );
    const desc = screen.getByTestId("desc-ref");
    expect(ref.current).toBe(desc);
  });

  it("merges custom className and props", () => {
    render(
      <AlertDescription className="abc" id="xyz">
        Text
      </AlertDescription>
    );
    const desc = screen.getByText("Text");
    expect(desc).toHaveClass("abc");
    expect(desc).toHaveAttribute("id", "xyz");
  });
});
