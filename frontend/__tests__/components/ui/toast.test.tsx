// __tests__/components/ui/toast.test.tsx
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from "@/components/ui/toast";

describe("Toast Component", () => {
  // Helper to wrap Toast and ensure viewport is rendered
  const wrap = (ui: React.ReactElement) =>
    render(
      <ToastProvider>
        <ToastViewport />
        {ui}
      </ToastProvider>
    );

  it("renders toast with title and description", () => {
    wrap(
      <Toast>
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>Toast Description</ToastDescription>
      </Toast>
    );

    expect(screen.getByText("Toast Title")).toBeInTheDocument();
    expect(screen.getByText("Toast Description")).toBeInTheDocument();
  });

  it("renders toast with action button and fires onClick", () => {
    const handleAction = jest.fn();
    wrap(
      <Toast>
        <ToastTitle>With Action</ToastTitle>
        <ToastAction altText="Do it" onClick={handleAction}>
          Do it
        </ToastAction>
      </Toast>
    );

    const actionBtn = screen.getByText("Do it");
    expect(actionBtn).toBeInTheDocument();

    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("renders toast with close button and fires onClick", () => {
    const handleClose = jest.fn();
    const { container } = wrap(
      <Toast>
        <ToastTitle>Closable</ToastTitle>
        <ToastClose onClick={handleClose} />
      </Toast>
    );

    // Close button is rendered as a <button>
    const closeBtn = container.querySelector("button");
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("applies custom className to Toast and subcomponents", () => {
    const { container } = wrap(
      <Toast className="toast-custom">
        <ToastTitle className="title-custom">Title</ToastTitle>
        <ToastDescription className="desc-custom">Desc</ToastDescription>
        <ToastAction className="action-custom" altText="Go">
          Go
        </ToastAction>
        <ToastClose className="close-custom" />
      </Toast>
    );

    expect(container.querySelector(".toast-custom")).toBeInTheDocument();
    expect(container.querySelector(".title-custom")).toBeInTheDocument();
    expect(container.querySelector(".desc-custom")).toBeInTheDocument();
    expect(container.querySelector(".action-custom")).toBeInTheDocument();
    expect(container.querySelector(".close-custom")).toBeInTheDocument();
  });

  it("renders different variants correctly", () => {
    const { rerender } = wrap(<Toast variant="default">Default</Toast>);
    expect(screen.getByText("Default")).toBeInTheDocument();

    // destructive variant should include destructive styles
    rerender(
      <ToastProvider>
        <ToastViewport />
        <Toast variant="destructive">Destructive</Toast>
      </ToastProvider>
    );

    const destructive = screen.getByText("Destructive");
    expect(destructive).toHaveClass("border-destructive");
  });
});
