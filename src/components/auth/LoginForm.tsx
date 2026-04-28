"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    let users: any[] = [];
    try {
      const raw = localStorage.getItem("habit-tracker-users");
      users = raw ? JSON.parse(raw) : [];
    } catch { users = []; }

    const user = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid email or password");
      return;
    }

    localStorage.setItem(
      "habit-tracker-session",
      JSON.stringify({ userId: user.id, email: user.email })
    );
    router.push("/dashboard");
  }

  return (
    <div className="w-full">
      {error && (
        <div className="alert-error mb-5" role="alert">{error}</div>
      )}

      <div className="mb-5" >
        <label htmlFor="login-email" className="field-label">Email</label>
        <input
          id="login-email"
          data-testid="auth-login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>

      <div className="mb-7"  >
        <label htmlFor="login-password" className="field-label">Password</label>
        <input
          id="login-password"
          data-testid="auth-login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="••••••••"
          className="input-field"
        />
      </div>

      <button
        data-testid="auth-login-submit"
        onClick={handleLogin}
        className="btn-primary w-full py-3 text-base"
      >
        Log In
      </button>

      <p className="text-center mt-5 text-sm text-stone-400">
        No account?{" "}
        <a href="/signup" className="text-orange-600 font-semibold hover:underline">
          Sign up free
        </a>
      </p>
    </div>
  );
}