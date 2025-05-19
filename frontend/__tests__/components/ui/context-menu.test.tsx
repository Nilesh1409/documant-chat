// __tests__/context-menu.test.tsx
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as ContextMenuComponents from "@/components/ui/context-menu";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@/lib/utils";

// Mock cn to join classNames simply
jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("ContextMenu primitives setup", () => {
  it("exports the Root, Trigger, Group, Portal, Sub, and RadioGroup correctly", () => {
    expect(ContextMenuComponents.ContextMenu).toBe(ContextMenuPrimitive.Root);
    expect(ContextMenuComponents.ContextMenuTrigger).toBe(
      ContextMenuPrimitive.Trigger
    );
    expect(ContextMenuComponents.ContextMenuGroup).toBe(
      ContextMenuPrimitive.Group
    );
    expect(ContextMenuComponents.ContextMenuPortal).toBe(
      ContextMenuPrimitive.Portal
    );
    expect(ContextMenuComponents.ContextMenuSub).toBe(ContextMenuPrimitive.Sub);
    expect(ContextMenuComponents.ContextMenuRadioGroup).toBe(
      ContextMenuPrimitive.RadioGroup
    );
  });
});

describe("ContextMenuContent", () => {
  it("forwards ref and renders children", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuContent ref={ref} data-testid="content">
        <div>Inner</div>
      </ContextMenuComponents.ContextMenuContent>
    );
    const content = screen.getByTestId("content");
    expect(ref.current).toBe(content);
    expect(content).toHaveTextContent("Inner");
  });

  it("merges custom className", () => {
    render(
      <ContextMenuComponents.ContextMenuContent
        className="extra"
        data-testid="content2"
      />
    );
    expect(screen.getByTestId("content2")).toHaveClass("extra");
  });
});

describe("ContextMenuSubTrigger", () => {
  it("renders with ChevronRight icon and inset padding", () => {
    render(
      <ContextMenuComponents.ContextMenuSubTrigger
        inset
        data-testid="subtrigger"
      >
        Sub
      </ContextMenuComponents.ContextMenuSubTrigger>
    );
    const btn = screen.getByTestId("subtrigger");
    // text
    expect(btn).toHaveTextContent("Sub");
    // inset class
    expect(btn).toHaveClass("pl-8");
    // ChevronRight svg
    expect(btn.querySelector("svg")).toBeInTheDocument();
  });

  it("forwards ref and custom props", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuSubTrigger
        ref={ref}
        id="st1"
        data-testid="subtrigger2"
      >
        X
      </ContextMenuComponents.ContextMenuSubTrigger>
    );
    const el = screen.getByTestId("subtrigger2");
    expect(ref.current).toBe(el);
    expect(el).toHaveAttribute("id", "st1");
  });
});

describe("ContextMenuSubContent", () => {
  it("forwards ref and merges classes", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuSubContent
        ref={ref}
        className="subextra"
        data-testid="subcontent"
      />
    );
    const el = screen.getByTestId("subcontent");
    expect(ref.current).toBe(el);
    expect(el).toHaveClass("subextra");
  });
});

describe("ContextMenuItem", () => {
  it("renders item with inset and custom className", () => {
    render(
      <ContextMenuComponents.ContextMenuItem
        inset
        className="ci"
        data-testid="item"
      >
        Item
      </ContextMenuComponents.ContextMenuItem>
    );
    const li = screen.getByTestId("item");
    expect(li).toHaveClass("pl-8", "ci");
    expect(li).toHaveTextContent("Item");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuItem ref={ref} data-testid="item2">
        Y
      </ContextMenuComponents.ContextMenuItem>
    );
    expect(ref.current).toBe(screen.getByTestId("item2"));
  });
});

describe("ContextMenuCheckboxItem", () => {
  it("renders with Check icon when checked", () => {
    render(
      <ContextMenuComponents.ContextMenuCheckboxItem checked data-testid="chk">
        CheckMe
      </ContextMenuComponents.ContextMenuCheckboxItem>
    );
    const item = screen.getByTestId("chk");
    expect(item).toHaveTextContent("CheckMe");
    // find nested svg
    expect(item.querySelector("svg")).toBeInTheDocument();
  });

  it("forwards ref and props", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuCheckboxItem
        ref={ref}
        id="chk1"
        data-testid="chk2"
      >
        A
      </ContextMenuComponents.ContextMenuCheckboxItem>
    );
    const el = screen.getByTestId("chk2");
    expect(ref.current).toBe(el);
    expect(el).toHaveAttribute("id", "chk1");
  });
});

describe("ContextMenuRadioItem", () => {
  it("renders with Circle icon", () => {
    render(
      <ContextMenuComponents.ContextMenuRadioItem data-testid="rad">
        Radio
      </ContextMenuComponents.ContextMenuRadioItem>
    );
    const item = screen.getByTestId("rad");
    expect(item).toHaveTextContent("Radio");
    expect(item.querySelector("svg")).toBeInTheDocument();
  });

  it("forwards ref and custom className", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuRadioItem
        ref={ref}
        className="rclass"
        data-testid="rad2"
      >
        B
      </ContextMenuComponents.ContextMenuRadioItem>
    );
    const el = screen.getByTestId("rad2");
    expect(ref.current).toBe(el);
    expect(el).toHaveClass("rclass");
  });
});

describe("ContextMenuLabel", () => {
  it("renders label with inset", () => {
    render(
      <ContextMenuComponents.ContextMenuLabel inset data-testid="lbl">
        Label
      </ContextMenuComponents.ContextMenuLabel>
    );
    const lbl = screen.getByTestId("lbl");
    expect(lbl).toHaveClass("pl-8");
    expect(lbl).toHaveTextContent("Label");
  });

  it("forwards ref and merges className", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuLabel
        ref={ref}
        className="lclass"
        id="lbl1"
        data-testid="lbl2"
      >
        L2
      </ContextMenuComponents.ContextMenuLabel>
    );
    const el = screen.getByTestId("lbl2");
    expect(ref.current).toBe(el);
    expect(el).toHaveClass("lclass");
    expect(el).toHaveAttribute("id", "lbl1");
  });
});

describe("ContextMenuSeparator", () => {
  it("renders separator with base classes", () => {
    render(<ContextMenuComponents.ContextMenuSeparator data-testid="sep" />);
    const sep = screen.getByTestId("sep");
    expect(sep).toHaveClass("-mx-1", "my-1", "h-px", "bg-border");
  });

  it("forwards ref and props", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <ContextMenuComponents.ContextMenuSeparator
        ref={ref}
        className="sclass"
        id="sep1"
        data-testid="sep2"
      />
    );
    const el = screen.getByTestId("sep2");
    expect(ref.current).toBe(el);
    expect(el).toHaveClass("sclass");
    expect(el).toHaveAttribute("id", "sep1");
  });
});

describe("ContextMenuShortcut", () => {
  it("renders span with correct classes and children", () => {
    render(
      <ContextMenuComponents.ContextMenuShortcut
        className="sc"
        data-testid="sc1"
      >
        Ctrl+C
      </ContextMenuComponents.ContextMenuShortcut>
    );
    const sc = screen.getByTestId("sc1");
    expect(sc.tagName).toBe("SPAN");
    expect(sc).toHaveClass(
      "ml-auto",
      "text-xs",
      "tracking-widest",
      "text-muted-foreground",
      "sc"
    );
    expect(sc).toHaveTextContent("Ctrl+C");
  });
});
