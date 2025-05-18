/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/auth/login/page";

// ─── React-Hook-Form stub ───────────────────────────────────────────────
// always call your onSubmit with these demo creds
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: (fn: any) => (evt: any) => {
      evt?.preventDefault?.();
      fn({ email: "me@example.com", password: "Secret123!" });
    },
    control: {},
  }),
}));

// ─── Next.js & Link ──────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

// ─── Toast & Auth ────────────────────────────────────────────────────────
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));
let loginMock = jest.fn();
jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ login: (...args: any[]) => loginMock(...args) }),
}));

// ─── Stub UI primitives ─────────────────────────────────────────────────
jest.mock("@/components/ui/button", () => ({
  __esModule: true,
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  __esModule: true,
  Input: (props: any) => <input {...props} />,
}));
jest.mock("@/components/ui/form", () => ({
  __esModule: true,
  Form: ({ children }: any) => <>{children}</>,
  FormField: ({ render }: any) =>
    render({
      field: {
        name: "",
        value: "",
        onChange: () => {},
        onBlur: () => {},
        ref: () => {},
      },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <>{children}</>,
  FormMessage: ({ children }: any) => <p>{children}</p>,
}));
jest.mock("lucide-react", () => ({
  __esModule: true,
  Loader2: () => <svg data-testid="spinner" />,
}));

describe("<LoginPage />", () => {
  beforeEach(() => {
    loginMock = jest.fn();
    render(<LoginPage />);
  });

  it("renders heading, placeholders and signup link", () => {
    expect(
      screen.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();

    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/auth/register"
    );
  });

  it("calls login and shows loading state", async () => {
    // make login hang so isLoading stays true
    loginMock.mockImplementation(() => new Promise(() => {}));

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // our stubbed handleSubmit always passes those creds
    expect(loginMock).toHaveBeenCalledWith("me@example.com", "Secret123!");

    const btn = screen.getByRole("button", { name: /signing in/i });
    expect(btn).toBeDisabled();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("re-enables form after successful login", async () => {
    loginMock.mockResolvedValueOnce(undefined);

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^sign in$/i })).toBeEnabled()
    );
  });
});
