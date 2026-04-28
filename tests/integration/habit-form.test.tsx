import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import HabitForm from "@/components/habits/HabitForm";
import HabitCard from "@/components/habits/HabitCard";
import type { Habit } from "@/types/habit";
import type { Session } from "@/types/auth";

const today = "2026-04-26";

const mockSession: Session = { userId: "user-1", email: "test@test.com" };

const mockHabit: Habit = {
  id: "habit-1",
  userId: "user-1",
  name: "Drink Water",
  description: "Stay hydrated",
  frequency: "daily",
  createdAt: "2026-01-01T00:00:00.000Z",
  completions: [],
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("habit-tracker-session", JSON.stringify(mockSession));
  localStorage.setItem("habit-tracker-habits", JSON.stringify([]));
});

describe("habit form", () => {
  it("shows a validation error when habit name is empty", () => {
    render(<HabitForm onCreated={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByTestId("habit-save-button"));
    expect(screen.getByText("Habit name is required")).toBeTruthy();
  });

  it("creates a new habit and renders it in the list", () => {
    const onCreated = vi.fn();
    render(<HabitForm onCreated={onCreated} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByTestId("habit-name-input"), {
      target: { value: "Drink Water" },
    });
    fireEvent.change(screen.getByTestId("habit-description-input"), {
      target: { value: "Stay hydrated" },
    });
    fireEvent.click(screen.getByTestId("habit-save-button"));

    expect(onCreated).toHaveBeenCalledOnce();
    const created = onCreated.mock.calls[0][0] as Habit;
    expect(created.name).toBe("Drink Water");
    expect(created.userId).toBe("user-1");
    expect(created.frequency).toBe("daily");
    expect(created.completions).toEqual([]);
  });

  it("edits an existing habit and preserves immutable fields", () => {
    const onCreated = vi.fn();

    render(
      <HabitForm
        existingHabit={mockHabit}
        onCreated={onCreated}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByTestId("habit-name-input"), {
      target: { value: "Drink More Water" },
    });
    fireEvent.click(screen.getByTestId("habit-save-button"));

    const updated = onCreated.mock.calls[0][0] as Habit;
    expect(updated.name).toBe("Drink More Water");
    // Immutable fields preserved
    expect(updated.id).toBe(mockHabit.id);
    expect(updated.userId).toBe(mockHabit.userId);
    expect(updated.createdAt).toBe(mockHabit.createdAt);
    expect(updated.completions).toEqual(mockHabit.completions);
    expect(updated.frequency).toBe("daily");
  });

  it("deletes a habit only after explicit confirmation", () => {
    const onDelete = vi.fn();
    const onUpdate = vi.fn();

    render(
      <HabitCard
        habit={mockHabit}
        today={today}
        onToggle={vi.fn()}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />
    );

    // Click delete — should NOT delete yet
    fireEvent.click(screen.getByTestId("habit-delete-drink-water"));
    expect(onDelete).not.toHaveBeenCalled();

    // Confirm delete — NOW it deletes
    fireEvent.click(screen.getByTestId("confirm-delete-button"));
    expect(onDelete).toHaveBeenCalledWith("habit-1");
  });

  it("toggles completion and updates the streak display", () => {
    const onUpdate = vi.fn();

    render(
      <HabitCard
        habit={mockHabit}
        today={today}
        onToggle={() => {
          // Simulate parent updating habit after toggle
          onUpdate({ ...mockHabit, completions: [today] });
        }}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    const streakBefore = screen.getByTestId("habit-streak-drink-water").textContent;
    fireEvent.click(screen.getByTestId("habit-complete-drink-water"));

    expect(onUpdate).toHaveBeenCalled();
    const updated = onUpdate.mock.calls[0][0] as Habit;
    expect(updated.completions).toContain(today);
  });
});