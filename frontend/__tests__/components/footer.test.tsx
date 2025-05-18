// __tests__/components/footer.test.tsx

import React from "react";
import { render, screen, within } from "@testing-library/react"; // ← added within
import Footer from "@/components/footer";

// Mock next/link to render a plain <a> with the href prop
jest.mock("next/link", () => {
  return ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
});

// Mock lucide-react FileText icon
jest.mock("lucide-react", () => ({
  FileText: () => <svg data-testid="file-text-icon" />,
}));

describe("<Footer />", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it("renders the logo with correct text and href", () => {
    const logoLink = screen.getByRole("link", { name: /DocManager/i });
    expect(logoLink).toHaveAttribute("href", "/");
    expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    expect(
      screen.getByText(
        /A modern document management system for organizing, sharing, and collaborating on your important files\./i
      )
    ).toBeVisible();
  });

  it("renders the Quick Links header", () => {
    expect(screen.getByRole("heading", { name: /Quick Links/i })).toBeVisible();
  });

  it("renders all quick link items with correct hrefs", () => {
    const links = [
      { text: "Home", href: "/" },
      { text: "Documents", href: "/documents" },
      { text: "About", href: "/about" },
    ];

    links.forEach(({ text, href }) => {
      const link = screen.getByRole("link", { name: text });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute("href", href);
    });
  });

  it("has the correct semantic structure", () => {
    // <footer> is role="contentinfo"
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    // description is a <p>
    const desc = screen.getByText(/A modern document management system/i);
    expect(desc.tagName).toBe("P");

    // quick links are in a <ul> with three <li>
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });
});
