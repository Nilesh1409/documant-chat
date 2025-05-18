import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import RegisterPage from "@/app/auth/register/page"; // adjust if path differs
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

// ─── mocks ────────────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/ui/use-toast", () => ({ useToast: jest.fn() }));

// ─── helpers ──────────────────────────────────────────────────────────────────
const mockRegister = jest.fn();
const mockPush = jest.fn();
const mockToast = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
    push: mockPush,
  });
  (useToast as jest.MockedFunction<typeof useToast>).mockReturnValue({
    toast: mockToast,
  });
  (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
    register: mockRegister,
  });
});

// ─── tests ────────────────────────────────────────────────────────────────────
describe("RegisterPage", () => {
  test("renders all form fields", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: /create an account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  test("shows validation errors for empty submit", async () => {
    render(<RegisterPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test("shows password-mismatch error", async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/first name/i), "Jane");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "12345678");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "87654321"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test("submits valid data and calls register()", async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "password123"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));

    expect(mockRegister).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      password: "password123",
    });
  });
});
