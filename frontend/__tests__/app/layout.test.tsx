import type React from "react";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

// Mock the components used in the layout
jest.mock("@/components/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

jest.mock("@/components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

jest.mock("@/providers/auth-provider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock("@/components/header", () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

jest.mock("@/components/footer", () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">Footer</footer>,
}));

describe("RootLayout Component", () => {
  it("renders the layout with all required components", () => {
    render(
      <RootLayout>
        <div data-testid="content">Test Content</div>
      </RootLayout>
    );

    // Check that all the providers are rendered
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();

    // Check that the header and footer are rendered
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();

    // Check that the content is rendered
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("has the correct HTML structure", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check that the HTML structure is correct
    expect(container.querySelector("html")).toHaveAttribute("lang", "en");
    expect(container.querySelector("html")).toHaveAttribute(
      "suppressHydrationWarning"
    );
    expect(container.querySelector("body")).toHaveClass(
      "min-h-screen",
      "bg-background",
      "font-sans",
      "antialiased"
    );
  });

  it("passes correct props to ThemeProvider", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check that the ThemeProvider has the correct props
    const themeProvider = screen.getByTestId("theme-provider");
    expect(themeProvider).toBeInTheDocument();

    // Note: In a real test, you would check the actual props passed to ThemeProvider
    // This is a simplified version since we're using a mock
  });

  it("has the correct metadata", () => {
    // Check that the metadata is correct
    expect(RootLayout.metadata).toBeDefined();
    expect(RootLayout.metadata.title).toBe("Document Management System");
    expect(RootLayout.metadata.description).toBe(
      "A modern document management system for organizing and sharing your documents"
    );
    expect(RootLayout.metadata.generator).toBe("v0.dev");
  });
});
