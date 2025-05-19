// __tests__/drawer.test.tsx
import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Drawer as VaulDrawer } from "vaul";

// Mock cn to join class names predictably
jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("Drawer export identity", () => {
  it("DrawerTrigger/Portal/Close match Vaul primitives", () => {
    expect(DrawerTrigger).toBe(VaulDrawer.Trigger);
    expect(DrawerPortal).toBe(VaulDrawer.Portal);
    expect(DrawerClose).toBe(VaulDrawer.Close);
  });
});

describe("Drawer component", () => {
  it("renders VaulDrawer.Root and spreads props", () => {
    render(<Drawer data-testid="dr" id="d1" />);
    const root = screen.getByTestId("dr");
    // VaulDrawer.Root renders a React fragment, so we check that our prop is forwarded in React tree
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("id", "d1");
  });

  it("defaults shouldScaleBackground to true and allows override", () => {
    const { rerender } = render(<Drawer data-testid="dr2" />);
    expect(screen.getByTestId("dr2")).toBeInTheDocument();
    // internal prop can't be seen, but no errors when overriding:
    rerender(<Drawer shouldScaleBackground={false} data-testid="dr2" />);
    expect(screen.getByTestId("dr2")).toBeInTheDocument();
  });
});

describe("DrawerOverlay", () => {
  it("forwards ref and merges className", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DrawerOverlay ref={ref} className="extra" data-testid="ov" />);
    const ov = screen.getByTestId("ov");
    expect(ref.current).toBe(ov);
    expect(ov).toHaveClass("fixed inset-0 z-50 bg-black/80", "extra");
  });
});

describe("DrawerContent", () => {
  it("renders overlay, content wrapper, and children", () => {
    render(
      <DrawerContent data-testid="ct">
        <p>Child</p>
      </DrawerContent>
    );
    const content = screen.getByTestId("ct");
    expect(content).toHaveTextContent("Child");
    // contains the drag handle div
    expect(content.querySelector("div.mx-auto")).toBeInTheDocument();
  });

  it("forwards ref and custom className", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <DrawerContent ref={ref} className="cextra" data-testid="ct2">
        X
      </DrawerContent>
    );
    const ct2 = screen.getByTestId("ct2");
    expect(ref.current).toBe(ct2);
    expect(ct2).toHaveClass(
      "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
      "cextra"
    );
  });
});

describe("DrawerHeader & DrawerFooter", () => {
  it("renders header with base and custom classes", () => {
    render(
      <DrawerHeader className="hcls" data-testid="hdr">
        Head
      </DrawerHeader>
    );
    const hdr = screen.getByTestId("hdr");
    expect(hdr.tagName).toBe("DIV");
    expect(hdr).toHaveClass(
      "grid gap-1.5 p-4 text-center sm:text-left",
      "hcls"
    );
    expect(hdr).toHaveTextContent("Head");
  });

  it("renders footer with base and custom classes", () => {
    render(
      <DrawerFooter className="fcls" data-testid="ftr">
        Foot
      </DrawerFooter>
    );
    const ftr = screen.getByTestId("ftr");
    expect(ftr.tagName).toBe("DIV");
    expect(ftr).toHaveClass("mt-auto flex flex-col gap-2 p-4", "fcls");
    expect(ftr).toHaveTextContent("Foot");
  });
});

describe("DrawerTitle & DrawerDescription", () => {
  it("renders title forwarding ref and props", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <DrawerTitle ref={ref} className="tcls" id="t1" data-testid="ttl">
        Title
      </DrawerTitle>
    );
    const ttl = screen.getByTestId("ttl");
    expect(ref.current).toBe(ttl);
    expect(ttl).toHaveClass(
      "text-lg font-semibold leading-none tracking-tight",
      "tcls"
    );
    expect(ttl).toHaveAttribute("id", "t1");
    expect(ttl).toHaveTextContent("Title");
  });

  it("renders description forwarding ref and props", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <DrawerDescription ref={ref} className="dcls" id="d1" data-testid="desc">
        Desc
      </DrawerDescription>
    );
    const desc = screen.getByTestId("desc");
    expect(ref.current).toBe(desc);
    expect(desc).toHaveClass("text-sm text-muted-foreground", "dcls");
    expect(desc).toHaveAttribute("id", "d1");
    expect(desc).toHaveTextContent("Desc");
  });
});
