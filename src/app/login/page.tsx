"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getUsers, setSession } from "@/lib/auth";
import type { User } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    const users = getUsers();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid email or password");
      return;
    }

    setSession({
      userId: user.id,
      email: user.email,
    });

    router.push("/dashboard");
  }

  return (
    <div>
      <h1>Login</h1>

      <input
        data-testid="auth-login-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        data-testid="auth-login-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p>{error}</p>}

      <button
        data-testid="auth-login-submit"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}