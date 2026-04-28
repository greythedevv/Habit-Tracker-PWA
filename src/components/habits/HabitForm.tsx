"use client";
import { useState } from "react";
import type { Habit } from "@/types/habit";
import type { Session } from "@/types/auth";
import { validateHabitName } from "@/lib/validators";

interface Props {
  existingHabit?: Habit;
  onCreated: (habit: Habit) => void;
  onCancel?: () => void;
}

export default function HabitForm({ existingHabit, onCreated, onCancel }: Props) {
  const [name, setName] = useState(existingHabit?.name ?? "");
  const [description, setDescription] = useState(existingHabit?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const result = validateHabitName(name);
    if (!result.valid) { setError(result.error); return; }

    if (existingHabit) {
      const updated: Habit = { ...existingHabit, name: result.value, description };
      try {
        const raw = localStorage.getItem("habit-tracker-habits");
        const all: Habit[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem(
          "habit-tracker-habits",
          JSON.stringify(all.map((h) => (h.id === updated.id ? updated : h)))
        );
      } catch {}
      onCreated(updated);
    } else {
      let session: Session | null = null;
      try {
        const raw = localStorage.getItem("habit-tracker-session");
        session = raw ? JSON.parse(raw) : null;
      } catch {}
      if (!session) return;

      const newHabit: Habit = {
        id: crypto.randomUUID(),
        userId: session.userId,
        name: result.value,
        description,
        frequency: "daily",
        createdAt: new Date().toISOString(),
        completions: [],
      };
      try {
        const raw = localStorage.getItem("habit-tracker-habits");
        const all: Habit[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem("habit-tracker-habits", JSON.stringify([...all, newHabit]));
      } catch {}
      onCreated(newHabit);
    }

    setName("");
    setDescription("");
    setError(null);
  }

  return (
    <div data-testid="habit-form" className="card p-6">
      <h2 className="text-xl text-stone-900 mb-5">
        {existingHabit ? "Edit Habit" : "New Habit"}
      </h2>

      {error && (
        <div className="alert-error mb-4" role="alert">{error}</div>
      )}

      <div className="mb-4">
        <label htmlFor="habit-name" className="field-label">Habit Name</label>
        <input
          id="habit-name"
          data-testid="habit-name-input"
          value={name}
          placeholder="e.g. Drink Water"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="input-field"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="habit-desc" className="field-label">Description (optional)</label>
        <input
          id="habit-desc"
          data-testid="habit-description-input"
          value={description}
          placeholder="e.g. 8 glasses a day"
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="habit-freq" className="field-label">Frequency</label>
        <select
          id="habit-freq"
          data-testid="habit-frequency-select"
          value="daily"
          disabled
          className="input-field opacity-60 cursor-not-allowed"
        >
          <option value="daily">Daily</option>
        </select>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
        <button
          data-testid="habit-save-button"
          onClick={handleSubmit}
          className="btn-primary"
        >
          {existingHabit ? "Save Changes" : "Create Habit"}
        </button>
      </div>
    </div>
  );
}