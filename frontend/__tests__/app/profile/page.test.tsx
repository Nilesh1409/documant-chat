import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/profile/page";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// ─── Mock Next.js router ──────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({ useRouter: () => ({}) }));

// ─── Mock our hooks ───────────────────────────────────────────────────────────
const mockUpdateProfile = jest.fn();
const mockToast = jest.fn();

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue({
    user: null,
    updateProfile: mockUpdateProfile,
  });
  (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
});

describe("ProfilePage", () => {
  test("shows spinner when user is not yet loaded", () => {
    render(<ProfilePage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("renders profile & password forms once user is present", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
      },
      updateProfile: mockUpdateProfile,
    });

    render(<ProfilePage />);

    expect(
      screen.getByRole("heading", { name: /Profile/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Your email address is/)).toHaveTextContent(
      "Your email address is alice@example.com"
    );

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Alice");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Smith");
    expect(
      screen.getByRole("button", { name: /update profile/i })
    ).toBeEnabled();

    expect(screen.getByLabelText(/current password/i)).toHaveValue("");
    expect(screen.getByLabelText(/new password/i)).toHaveValue("");
    expect(screen.getByLabelText(/confirm password/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /update password/i })
    ).toBeEnabled();
  });

  test("updates profile successfully", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstName: "A", lastName: "B", email: "e@e.com" },
      updateProfile: mockUpdateProfile.mockResolvedValueOnce(undefined),
    });

    render(<ProfilePage />);
    const firstName = screen.getByLabelText(/first name/i);
    const lastName = screen.getByLabelText(/last name/i);
    const btn = screen.getByRole("button", { name: /update profile/i });

    await userEvent.clear(firstName);
    await userEvent.type(firstName, "NewName");
    await userEvent.clear(lastName);
    await userEvent.type(lastName, "NewLast");
    await userEvent.click(btn);

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        firstName: "NewName",
        lastName: "NewLast",
      })
    );

    expect(mockToast).toHaveBeenCalledWith({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  });

  test("shows validation errors in profile form", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstName: "", lastName: "", email: "e@e.com" },
      updateProfile: mockUpdateProfile,
    });

    render(<ProfilePage />);
    await userEvent.click(
      screen.getByRole("button", { name: /update profile/i })
    );

    expect(
      await screen.findByText(/First name is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Last name is required/i)
    ).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  test("updates password successfully", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstName: "A", lastName: "B", email: "e@e.com" },
      updateProfile: mockUpdateProfile.mockResolvedValueOnce(undefined),
    });

    render(<ProfilePage />);
    const currentPw = screen.getByLabelText(/current password/i);
    const newPw = screen.getByLabelText(/new password/i);
    const confirmPw = screen.getByLabelText(/confirm password/i);
    const btn = screen.getByRole("button", { name: /update password/i });

    await userEvent.type(currentPw, "oldpass");
    await userEvent.type(newPw, "newpassword");
    await userEvent.type(confirmPw, "newpassword");
    await userEvent.click(btn);

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        password: "newpassword",
      })
    );

    expect(mockToast).toHaveBeenCalledWith({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });

    expect(
      (screen.getByLabelText(/current password/i) as HTMLInputElement).value
    ).toBe("");
  });

  test("shows password validation errors", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstName: "A", lastName: "B", email: "e@e.com" },
      updateProfile: mockUpdateProfile,
    });

    render(<ProfilePage />);
    await userEvent.click(
      screen.getByRole("button", { name: /update password/i })
    );

    expect(
      await screen.findByText(/Current password is required/i)
    ).toBeInTheDocument();

    const tooShortMsgs = await screen.findAllByText(
      /Password must be at least 8 characters/i
    );
    expect(tooShortMsgs.length).toBeGreaterThan(0);

    // Now test mismatch
    await userEvent.type(screen.getByLabelText(/current password/i), "oldpass");
    await userEvent.type(screen.getByLabelText(/new password/i), "password1");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "password2"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /update password/i })
    );

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
