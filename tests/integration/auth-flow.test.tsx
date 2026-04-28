import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import SignupForm from "@/components/auth/SignupForm";
import LoginForm from "@/components/auth/LoginForm";

beforeEach(() => {
  localStorage.clear();
});

describe("auth flow", () => {
  it("submits the signup form and creates a session", () => {
    render(<SignupForm />);

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
    // Pre-seed an existing user
    const existing = {
      id: "existing-1",
      email: "dupe@test.com",
      password: "password123",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("habit-tracker-users", JSON.stringify([existing]));

    render(<SignupForm />);

    fireEvent.change(screen.getByTestId("auth-signup-email"), {
      target: { value: "dupe@test.com" },
    });
    fireEvent.change(screen.getByTestId("auth-signup-password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("auth-signup-submit"));

    expect(screen.getByText("User already exists")).toBeTruthy();
  });

  it("submits the login form and stores the active session", () => {
    const user = {
      id: "user-1",
      email: "login@test.com",
      password: "pass123",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("habit-tracker-users", JSON.stringify([user]));

    render(<LoginForm />);

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
    render(<LoginForm />);

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