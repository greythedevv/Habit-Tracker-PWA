import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import SignupPage from "@/app/signup/page";
import LoginPage from "@/app/login/page";

beforeEach(() => {
  localStorage.clear();
});

describe("auth flow", () => {
  it("submits the signup form and creates a session", () => {
    render(<SignupPage />);

    fireEvent.change(screen.getByTestId("auth-signup-email"), {
      target: { value: "newuser@test.com" },
    });
    fireEvent.change(screen.getByTestId("auth-signup-password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("auth-signup-submit"));

    const session = localStorage.getItem("habit-tracker-session");
    expect(session).not.toBeNull();
    const parsed = JSON.parse(session!);
    expect(parsed.email).toBe("newuser@test.com");
  });

  it("shows an error for duplicate signup email", () => {
    render(<SignupPage />);

    // First signup
    fireEvent.change(screen.getByTestId("auth-signup-email"), {
      target: { value: "dupe@test.com" },
    });
    fireEvent.change(screen.getByTestId("auth-signup-password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("auth-signup-submit"));

    // Second signup with same email — need fresh render
    localStorage.removeItem("habit-tracker-session");
    render(<SignupPage />);

    const emails = screen.getAllByTestId("auth-signup-email");
    const passwords = screen.getAllByTestId("auth-signup-password");
    const submits = screen.getAllByTestId("auth-signup-submit");

    fireEvent.change(emails[emails.length - 1], {
      target: { value: "dupe@test.com" },
    });
    fireEvent.change(passwords[passwords.length - 1], {
      target: { value: "password123" },
    });
    fireEvent.click(submits[submits.length - 1]);

    expect(screen.getByText("User already exists")).toBeTruthy();
  });

  it("submits the login form and stores the active session", () => {
    // Pre-create a user
    const user = {
      id: "user-1",
      email: "login@test.com",
      password: "pass123",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("habit-tracker-users", JSON.stringify([user]));

    render(<LoginPage />);

    fireEvent.change(screen.getByTestId("auth-login-email"), {
      target: { value: "login@test.com" },
    });
    fireEvent.change(screen.getByTestId("auth-login-password"), {
      target: { value: "pass123" },
    });
    fireEvent.click(screen.getByTestId("auth-login-submit"));

    const session = localStorage.getItem("habit-tracker-session");
    expect(session).not.toBeNull();
    const parsed = JSON.parse(session!);
    expect(parsed.email).toBe("login@test.com");
  });

  it("shows an error for invalid login credentials", () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByTestId("auth-login-email"), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByTestId("auth-login-password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("auth-login-submit"));

    expect(screen.getByText("Invalid email or password")).toBeTruthy();
  });
});