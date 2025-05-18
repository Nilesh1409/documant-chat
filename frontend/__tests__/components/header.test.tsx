/**
 * Header component tests – compatible with Radix markup
 * Coverage target: > 90 %
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import "@testing-library/jest-dom";

/* ------------------------------------------------------------------ mocks */
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));
jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockLogout = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

/* ----------------------------------------------------------- helpers */
const setAuth = (override: Partial<ReturnType<typeof useAuth>> = {}) => {
  (useAuth as jest.Mock).mockReturnValue({
    user: null,
    isLoading: false,
    logout: mockLogout,
    ...override,
  });
};
const setPath = (path: string) =>
  (usePathname as jest.Mock).mockReturnValue(path);

/* -------------------------------------------------------------- tests */
describe("Header – unauthenticated", () => {
  it("shows logo, desktop nav and auth links", () => {
    setAuth();
    setPath("/");

    render(<Header />);

    expect(screen.getByText("DocManager")).toBeVisible();

    ["Home", "Q&A", "Documents", "About"].forEach((txt) =>
      expect(screen.getByText(txt)).toBeVisible()
    );

    // Auth controls are rendered as <a>, so use role="link"
    expect(screen.getByRole("link", { name: "Log in" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeVisible();
  });
});

describe("Header – authenticated viewer", () => {
  const viewer = {
    firstName: "Tom",
    lastName: "User",
    email: "tom@example.com",
    role: "viewer",
  };

  it("renders avatar dropdown and logs out", async () => {
    setAuth({ user: viewer });
    setPath("/");

    render(<Header />);
    const user = userEvent.setup();

    // Avatar trigger is named by its initial ("T")
    const avatarBtn = screen.getByRole("button", { name: /T/i });
    await user.click(avatarBtn);

    // Dropdown items
    const menu = await screen.findByRole("menu");
    expect(
      within(menu).getByRole("menuitem", { name: /profile/i })
    ).toBeVisible();
    expect(
      within(menu).getByRole("menuitem", { name: /my documents/i })
    ).toBeVisible();

    // Logout
    await user.click(within(menu).getByRole("menuitem", { name: /log out/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});

describe("Header – authenticated admin", () => {
  const admin = {
    firstName: "Alice",
    lastName: "Root",
    email: "alice@example.com",
    role: "admin",
  };

  it("shows Admin link and Admin Panel in dropdown", async () => {
    setAuth({ user: admin });
    setPath("/admin");

    render(<Header />);
    const user = userEvent.setup();

    expect(screen.getByRole("link", { name: "Admin" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /A/i }));
    expect(
      screen.getByRole("menuitem", { name: /admin panel/i })
    ).toBeVisible();
  });
});

describe("Header – active link highlighting", () => {
  it("highlights Documents when pathname starts with /documents", () => {
    setAuth();
    setPath("/documents/123");

    render(<Header />);
    expect(screen.getByText("Documents")).toHaveClass("text-emerald-600");
    expect(screen.getByText("Home")).not.toHaveClass("text-emerald-600");
  });
});
