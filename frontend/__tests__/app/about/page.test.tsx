/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// —————————————————————————————————————————————————————————————
// 2) Stub out your UI primitives so they don’t bloat the snapshot
// —————————————————————————————————————————————————————————————
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, ...props }: any) => (
    // we deliberately pull out `asChild` so it never ends up on a real DOM node
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <header>{children}</header>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
}));

// —————————————————————————————————————————————————————————————
// 3) Stub lucide-react icons to simple <span> placeholders
// —————————————————————————————————————————————————————————————
jest.mock("lucide-react", () => ({
  __esModule: true,
  ArrowRight: () => <span data-testid="icon-arrow">→</span>,
  FileText: () => <span data-testid="icon-file">📄</span>,
  Users: () => <span data-testid="icon-users">👥</span>,
  Shield: () => <span data-testid="icon-shield">🛡️</span>,
  Zap: () => <span data-testid="icon-zap">⚡</span>,
}));

// —————————————————————————————————————————————————————————————
// 4) Now import the component under test
// —————————————————————————————————————————————————————————————
import AboutPage from "@/app/about/page";

describe("<AboutPage />", () => {
  it("renders the main heading and subheading", () => {
    render(<AboutPage />);

    // Main title
    expect(
      screen.getByRole("heading", { level: 1, name: /about docmanager/i })
    ).toBeInTheDocument();

    // Subheading / intro paragraph
    expect(
      screen.getByText(
        /A modern document management system designed to help you organize, share, and collaborate/i
      )
    ).toBeVisible();
  });

  it("renders the “Our Mission” section", () => {
    render(<AboutPage />);

    // Section heading
    expect(
      screen.getByRole("heading", { level: 2, name: /our mission/i })
    ).toBeInTheDocument();

    // First mission paragraph
    expect(
      screen.getByText(
        /At DocManager, we believe that effective document management is essential for any organization/i
      )
    ).toBeVisible();

    // Second mission paragraph
    expect(
      screen.getByText(
        /We're committed to helping teams of all sizes manage their documents more efficiently/i
      )
    ).toBeVisible();
  });

  it("shows all four key-feature cards with correct titles & descriptions", () => {
    render(<AboutPage />);

    const features = [
      {
        title: /Document Management/i,
        desc: /Upload, organize, and manage all your documents in one secure place/i,
        icon: "icon-file",
      },
      {
        title: /User Permissions/i,
        desc: /Control who can view, edit, or manage your documents with granular permission settings/i,
        icon: "icon-users",
      },
      {
        title: /Security/i,
        desc: /Keep your documents secure with role-based access control and comprehensive audit trails/i,
        icon: "icon-shield",
      },
      {
        title: /Fast Search/i,
        desc: /Quickly find the documents you need with powerful search capabilities and tagging/i,
        icon: "icon-zap",
      },
    ];

    for (const { title, desc, icon } of features) {
      // Card title
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();

      // Corresponding description
      expect(screen.getByText(desc)).toBeVisible();

      // Icon placeholder is rendered
      expect(screen.getByTestId(icon)).toBeInTheDocument();
    }
  });

  it("includes a “Get Started Today” section with a working register link", () => {
    render(<AboutPage />);

    // Section heading
    expect(
      screen.getByRole("heading", { level: 2, name: /get started today/i })
    ).toBeInTheDocument();

    // Register call-to-action text
    const ctaLink = screen.getByRole("link", { name: /create your account/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/auth/register");

    // Arrow icon inside that button
    expect(screen.getByTestId("icon-arrow")).toBeInTheDocument();
  });
});
