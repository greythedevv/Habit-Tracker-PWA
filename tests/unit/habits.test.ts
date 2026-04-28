import { describe, it, expect } from "vitest";
import { toggleHabitCompletion } from "@/lib/habits";
import type { Habit } from "@/types/habit";

const baseHabit: Habit = {
  id: "habit-1",
  userId: "user-1",
  name: "Drink Water",
  description: "",
  frequency: "daily",
  createdAt: "2026-01-01T00:00:00.000Z",
  completions: [],
};

describe("toggleHabitCompletion", () => {
  it("adds a completion date when the date is not present", () => {
    const result = toggleHabitCompletion(baseHabit, "2026-04-26");
    expect(result.completions).toContain("2026-04-26");
  });

  it("removes a completion date when the date already exists", () => {
    const habit = { ...baseHabit, completions: ["2026-04-26"] };
    const result = toggleHabitCompletion(habit, "2026-04-26");
    expect(result.completions).not.toContain("2026-04-26");
  });

  it("does not mutate the original habit object", () => {
    const habit = { ...baseHabit, completions: ["2026-04-25"] };
    const original = [...habit.completions];
    toggleHabitCompletion(habit, "2026-04-26");
    expect(habit.completions).toEqual(original);
  });

  it("does not return duplicate completion dates", () => {
    // Even if somehow duplicates exist, toggling in should not add more
    const habit = { ...baseHabit, completions: ["2026-04-26", "2026-04-26"] };
    const result = toggleHabitCompletion(habit, "2026-04-25");
    const count = result.completions.filter((d) => d === "2026-04-26").length;
    expect(count).toBeLessThanOrEqual(1);
  });
});