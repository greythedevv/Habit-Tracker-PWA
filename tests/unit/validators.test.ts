import { describe, it, expect } from "vitest";
import { validateHabitName } from "@/lib/validators";

describe("validateHabitName", () => {
  it("returns an error when habit name is empty", () => {
    expect(validateHabitName("")).toEqual({
      valid: false,
      value: "",
      error: "Habit name is required",
    });
  });

  it("returns an error when habit name exceeds 60 characters", () => {
    expect(validateHabitName("a".repeat(61)).error).toBe(
      "Habit name must be 60 characters or fewer"
    );
  });

  it("returns a trimmed value when habit name is valid", () => {
    expect(validateHabitName("  Drink Water  ").value).toBe(
      "Drink Water"
    );
  });
});