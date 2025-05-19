// __tests__/breadcrumb.test.tsx
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

// Mock cn to join classNames simply
jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("Breadcrumb", () => {
  it("renders a nav with aria-label and spreads props", () => {
    render(<Breadcrumb data-testid="bc" id="nav1" />);
    const nav = screen.getByTestId("bc");
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("aria-label", "breadcrumb");
    expect(nav).toHaveAttribute("id", "nav1");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} data-testid="bc-ref" />);
    expect(ref.current).toBe(screen.getByTestId("bc-ref"));
  });
});

describe("BreadcrumbList", () => {
  it("renders an ol with base classes and merges className", () => {
    render(<BreadcrumbList data-testid="list" className="extra" />);
    const ol = screen.getByTestId("list");
    expect(ol.tagName).toBe("OL");
    expect(ol).toHaveClass(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      "extra"
    );
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLOListElement>();
    render(<BreadcrumbList ref={ref} data-testid="list-ref" />);
    expect(ref.current).toBe(screen.getByTestId("list-ref"));
  });
});

describe("BreadcrumbItem", () => {
  it("renders an li with base classes and custom className", () => {
    render(<BreadcrumbItem data-testid="item" className="cls" />);
    const li = screen.getByTestId("item");
    expect(li.tagName).toBe("LI");
    expect(li).toHaveClass("inline-flex items-center gap-1.5", "cls");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLLIElement>();
    render(<BreadcrumbItem ref={ref} data-testid="item-ref" />);
    expect(ref.current).toBe(screen.getByTestId("item-ref"));
  });
});

describe("BreadcrumbLink", () => {
  it("renders an <a> by default with classes and href", () => {
    render(
      <BreadcrumbLink href="/home" data-testid="link">
        Home
      </BreadcrumbLink>
    );
    const a = screen.getByTestId("link");
    expect(a.tagName).toBe("A");
    expect(a).toHaveAttribute("href", "/home");
    expect(a).toHaveClass("transition-colors hover:text-foreground");
    expect(a).toHaveTextContent("Home");
  });

  it("renders as child when asChild is true", () => {
    render(
      <BreadcrumbLink asChild data-testid="link-span">
        <span className="child">Child</span>
      </BreadcrumbLink>
    );
    const span = screen.getByText("Child");
    expect(span.tagName).toBe("SPAN");
    expect(span).toHaveClass("child");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <BreadcrumbLink ref={ref} href="#" data-testid="link-ref">
        X
      </BreadcrumbLink>
    );
    expect(ref.current).toBe(screen.getByTestId("link-ref"));
  });
});

describe("BreadcrumbPage", () => {
  it("renders a span with correct roles and classes", () => {
    render(<BreadcrumbPage data-testid="page">Current</BreadcrumbPage>);
    const span = screen.getByTestId("page");
    expect(span.tagName).toBe("SPAN");
    expect(span).toHaveAttribute("role", "link");
    expect(span).toHaveAttribute("aria-disabled", "true");
    expect(span).toHaveAttribute("aria-current", "page");
    expect(span).toHaveClass("font-normal text-foreground");
    expect(span).toHaveTextContent("Current");
  });

  it("forwards ref and custom props", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <BreadcrumbPage ref={ref} id="p1" data-testid="page-ref">
        P
      </BreadcrumbPage>
    );
    const el = screen.getByTestId("page-ref");
    expect(ref.current).toBe(el);
    expect(el).toHaveAttribute("id", "p1");
  });
});

describe("BreadcrumbSeparator", () => {
  it("renders a li with ChevronRight by default", () => {
    render(<BreadcrumbSeparator data-testid="sep" />);
    const li = screen.getByTestId("sep");
    expect(li.tagName).toBe("LI");
    expect(li).toHaveAttribute("role", "presentation");
    expect(li).toHaveAttribute("aria-hidden", "true");
    // should contain an SVG icon
    expect(li.querySelector("svg")).toBeInTheDocument();
  });

  it("renders custom children instead of default icon", () => {
    render(
      <BreadcrumbSeparator data-testid="sep-child">
        <span>--</span>
      </BreadcrumbSeparator>
    );
    const li = screen.getByTestId("sep-child");
    expect(li).toHaveTextContent("--");
    expect(li.querySelector("svg")).not.toBeInTheDocument();
  });

  it("applies custom className and props", () => {
    render(
      <BreadcrumbSeparator className="cls" id="s1" data-testid="sep-props" />
    );
    const li = screen.getByTestId("sep-props");
    expect(li).toHaveClass("cls");
    expect(li).toHaveAttribute("id", "s1");
  });
});

describe("BreadcrumbEllipsis", () => {
  it("renders a span with MoreHorizontal icon and sr-only text", () => {
    render(<BreadcrumbEllipsis data-testid="ell" className="clz" />);
    const span = screen.getByTestId("ell");
    expect(span.tagName).toBe("SPAN");
    expect(span).toHaveAttribute("role", "presentation");
    expect(span).toHaveAttribute("aria-hidden", "true");
    // icon
    expect(span.querySelector("svg")).toBeInTheDocument();
    // sr-only text
    expect(span.querySelector(".sr-only")).toHaveTextContent("More");
    expect(span).toHaveClass("flex h-9 w-9 items-center justify-center", "clz");
  });
});
