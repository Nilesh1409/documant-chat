// __tests__/components/ui/input-otp.test.tsx
import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  OTPInputContext,
} from "@/components/ui/input-otp";

describe("InputOTP", () => {
  it("forwards className and containerClassName to OTPInput", () => {
    const { container } = render(
      <InputOTP className="my-input" containerClassName="my-container" />
    );
    // Outer wrapper should have the containerClassName
    const wrapper = container.querySelector(".my-container");
    expect(wrapper).toBeInTheDocument();

    // Inside it, the <input> should have the passed className
    const input = wrapper?.querySelector("input");
    expect(input).toHaveClass("my-input");
  });
});

describe("InputOTPGroup", () => {
  it("renders a div with given className and children", () => {
    render(
      <InputOTPGroup className="group-class" data-testid="group">
        <span>Child</span>
      </InputOTPGroup>
    );
    const group = screen.getByTestId("group");
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass("group-class");
    expect(group).toHaveTextContent("Child");
  });
});

describe("InputOTPSlot", () => {
  const renderWithContext = (slots: any[]) =>
    render(
      <OTPInputContext.Provider value={{ slots }}>
        <InputOTPSlot index={0} data-testid="slot" />
      </OTPInputContext.Provider>
    );

  it("renders the character from context.slots[index].char", () => {
    renderWithContext([{ char: "5", hasFakeCaret: false, isActive: false }]);
    expect(screen.getByTestId("slot")).toHaveTextContent("5");
  });

  it("adds ring classes when isActive is true", () => {
    renderWithContext([{ char: "", hasFakeCaret: false, isActive: true }]);
    const slot = screen.getByTestId("slot");
    expect(slot).toHaveClass("ring-2");
  });

  it("shows the fake caret when hasFakeCaret is true", () => {
    renderWithContext([{ char: "", hasFakeCaret: true, isActive: false }]);
    const slot = screen.getByTestId("slot");
    expect(slot.querySelector(".animate-caret-blink")).toBeInTheDocument();
  });
});

describe("InputOTPSeparator", () => {
  it("renders an element with role=separator and the Dot icon", () => {
    render(<InputOTPSeparator data-testid="sep" />);
    const sep = screen.getByTestId("sep");
    expect(sep).toHaveAttribute("role", "separator");
    // Should render an <svg> (the Dot icon)
    expect(sep.querySelector("svg")).toBeInTheDocument();
  });
});
