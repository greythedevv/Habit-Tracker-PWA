"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getUsers, saveUsers, setSession } from "@/lib/auth";
import type { User } from "@/types/auth";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSignup() {
    const users = getUsers();

    const exists = users.find((u) => u.email === email);

    if (exists) {
      setError("User already exists");
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];

    saveUsers(updatedUsers);

    setSession({
      userId: newUser.id,
      email: newUser.email,
    });

    router.push("/dashboard");
  }

  return (
    <div>
      <h1>Signup</h1>

      <input
        data-testid="auth-signup-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />

      <input
        data-testid="auth-signup-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />

      {error && <p>{error}</p>}

      <button
        data-testid="auth-signup-submit"
        onClick={handleSignup}
      >
        Signup
      </button>
    </div>
  );
}