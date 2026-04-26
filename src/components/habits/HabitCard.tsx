"use client";

import type { Habit } from "@/types/habit";
import { toggleHabitCompletion } from "@/lib/habits";

interface Props {
  habit: Habit;
  today: string;
  onUpdate: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({
  habit,
  today,
  onUpdate,
  onDelete,
}: Props) {
  const slug = habit.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const isCompleted = habit.completions.includes(today);

  const streak = habit.completions.length;

  function handleToggle() {
    const updated = toggleHabitCompletion(habit, today);
    onUpdate(updated);
  }

  return (
    <div data-testid={`habit-card-${slug}`}>
      {/* TITLE */}
      <h3>{habit.name}</h3>

      {/* STREAK */}
      <p data-testid={`habit-streak-${slug}`}>
        🔥 {streak} days
      </p>

      {/* COMPLETE BUTTON */}
      <button
        data-testid={`habit-complete-${slug}`}
        onClick={handleToggle}
      >
        {isCompleted ? "Undo" : "Complete"}
      </button>

      {/* EDIT (placeholder for now) */}
      <button data-testid={`habit-edit-${slug}`}>
        Edit
      </button>

      {/* DELETE */}
      <button
        data-testid={`habit-delete-${slug}`}
        onClick={() => onDelete(habit.id)}
      >
        Delete
      </button>
    </div>
  );
}