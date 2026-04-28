"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSignup() {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    let users: any[] = [];
    try {
      const raw = localStorage.getItem("habit-tracker-users");
      users = raw ? JSON.parse(raw) : [];
    } catch { users = []; }

    if (users.find((u: any) => u.email === email)) {
      setError("User already exists");
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "habit-tracker-users",
      JSON.stringify([...users, newUser])
    );
    localStorage.setItem(
      "habit-tracker-session",
      JSON.stringify({ userId: newUser.id, email: newUser.email })
    );
    router.push("/dashboard");
  }

  return (
    <div className="w-full">
      {error && (
        <div className="alert-error mb-5" role="alert">{error}</div>
      )}

      <div className="mb-5" >
        <label htmlFor="signup-email" className="field-label">Email</label>
        <input
          id="signup-email"
          data-testid="auth-signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>

      <div className="mb-7">
        <label htmlFor="signup-password" className="field-label">Password</label>
        <input
          id="signup-password"
          data-testid="auth-signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          placeholder="••••••••"
          className="input-field"
        />
      </div>

      <button
        data-testid="auth-signup-submit"
        onClick={handleSignup}
        className="btn-primary w-full py-3 text-base"
      >
        Create Account
      </button>

      <p className="text-center mt-5 text-sm text-stone-400">
        Already have an account?{" "}
        <a href="/login" className="text-orange-600 font-semibold hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}