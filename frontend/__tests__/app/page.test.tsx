import { render, screen } from "@testing-library/react";
import Home from "@/app/page"; // adjust if your file is under a different path
import "@testing-library/jest-dom";

describe("Home page", () => {
  beforeEach(() => {
    render(<Home />);
  });

  it("renders the hero heading and description", () => {
    expect(
      screen.getByRole("heading", {
        name: /Manage Your Documents with Ease and Security/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /A powerful document management system that helps you organize, share, and collaborate on your important files\./i
      )
    ).toBeInTheDocument();
  });

  it("renders hero call-to-action buttons with correct links", () => {
    // Browse Documents
    const browseLink = screen.getByRole("link", {
      name: /Browse Documents/i,
    });
    expect(browseLink).toHaveAttribute("href", "/documents");

    // Get Started
    const getStartedLink = screen.getByRole("link", {
      name: /Get Started/i,
    });
    expect(getStartedLink).toHaveAttribute("href", "/auth/register");
  });

  it("renders the feature cards", () => {
    expect(
      screen.getByRole("heading", { name: /Document Management/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Upload, organize, and manage all your documents/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /User Permissions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Control who can view, edit, or manage your documents/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Version Control/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Keep track of document changes with comprehensive version history/i
      )
    ).toBeInTheDocument();
  });

  it("renders the hero image with alt text", () => {
    const img = screen.getByAltText(/Document Management System/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveClass("rounded-lg shadow-xl");
  });

  it("renders the final CTA section and link", () => {
    expect(
      screen.getByRole("heading", { name: /Ready to get started\?/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Join thousands of users who trust our platform for their document management needs\./i
      )
    ).toBeInTheDocument();

    const ctaLink = screen.getByRole("link", {
      name: /Create Your Account/i,
    });
    expect(ctaLink).toHaveAttribute("href", "/auth/register");
  });
});
