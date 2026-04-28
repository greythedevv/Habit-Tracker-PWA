"use client";
import { useState } from "react";
import type { Habit } from "@/types/habit";
import { getHabitSlug } from "@/lib/slug";
import { calculateCurrentStreak } from "@/lib/streaks";

interface Props {
  habit: Habit;
  today: string;
  onToggle: () => void;
  onUpdate: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export default function HabitCard({ habit, today, onToggle, onDelete, onEdit }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const isCompleted = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`card p-5 transition-all duration-200 ${
        isCompleted
          ? "border-l-4 border-l-emerald-500"
          : "border-l-4 border-l-stone-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">

        {/* LEFT */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={`text-lg leading-tight ${
              isCompleted ? "text-emerald-700" : "text-stone-900"
            }`}>
              {habit.name}
            </h3>
            {isCompleted && (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                ✓ Done
              </span>
            )}
          </div>

          {habit.description && (
            <p className="text-sm text-stone-400 mb-3">{habit.description}</p>
          )}

          {/* Streak badge */}
          <div
            data-testid={`habit-streak-${slug}`}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
              streak > 0
                ? "bg-orange-50 text-orange-600 border-orange-100"
                : "bg-stone-50 text-stone-400 border-stone-200"
            }`}
          >
            🔥 {streak} day{streak !== 1 ? "s" : ""} streak
          </div>
        </div>

        {/* RIGHT: actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            data-testid={`habit-complete-${slug}`}
            onClick={onToggle}
            className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-150 active:scale-95 ${
              isCompleted
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600 hover:text-white"
            }`}
          >
            {isCompleted ? "✓ Done" : "Complete"}
          </button>

          <button
            data-testid={`habit-edit-${slug}`}
            onClick={onEdit}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Edit
          </button>

          {confirmingDelete ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-red-500 font-semibold text-center">Sure?</span>
              <button
                data-testid="confirm-delete-button"
                onClick={() => onDelete(habit.id)}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              data-testid={`habit-delete-${slug}`}
              onClick={() => setConfirmingDelete(true)}
              className="btn-danger text-xs px-3 py-1.5"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}