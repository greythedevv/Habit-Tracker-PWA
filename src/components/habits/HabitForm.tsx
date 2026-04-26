"use client";

import { useState } from "react";
import type { Habit } from "@/types/habit";
import type { Session } from "@/types/auth";

import { getItem, setItem } from "@/lib/storage";
import { HABITS_KEY, SESSION_KEY } from "@/lib/constants";
import { validateHabitName } from "@/lib/validators";

interface Props {
  onCreated: (habit: Habit) => void;
}

export default function HabitForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const session = getItem<Session>(SESSION_KEY);
    if (!session) return;

    const result = validateHabitName(name);

    if (!result.valid) {
      setError(result.error);
      return;
    }

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      userId: session.userId,
      name: result.value,
      description,
      frequency: "daily",
      createdAt: new Date().toISOString(),
      completions: [],
    };

    const existing = getItem<Habit[]>(HABITS_KEY) || [];

    const updated = [...existing, newHabit];

    setItem(HABITS_KEY, updated);

    onCreated(newHabit);

    setName("");
    setDescription("");
    setError(null);
  }

  return (
    <div data-testid="habit-form">
      <input
        data-testid="habit-name-input"
        value={name}
        placeholder="Habit name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        data-testid="habit-description-input"
        value={description}
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <p>{error}</p>}

      <button
        data-testid="habit-save-button"
        onClick={handleSubmit}
      >
        Save
      </button>
    </div>
  );
}