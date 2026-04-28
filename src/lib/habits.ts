import type { Habit } from "../types/habit";

export function toggleHabitCompletion(
  habit: Habit,
  date: string
): Habit {
  const completions = [...habit.completions];

  const index = completions.indexOf(date);

  let updatedCompletions: string[];

  if (index === -1) {
    // add completion
    updatedCompletions = [...completions, date];
  } else {
    // remove completion
    updatedCompletions = completions.filter((d) => d !== date);
  }

  // ✅ FIX: always remove duplicates
  const uniqueCompletions = Array.from(new Set(updatedCompletions));

  return {
    ...habit,
    completions: uniqueCompletions,
  };
}