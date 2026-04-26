"use client";

import HabitCard from "@/components/habits/HabitCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Habit } from "@/types/habit";
import type { Session } from "@/types/auth";

import { getItem, setItem } from "@/lib/storage";
import { SESSION_KEY, HABITS_KEY } from "@/lib/constants";
import { toggleHabitCompletion } from "@/lib/habits";

export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const s = getItem<Session>(SESSION_KEY);

    if (!s) {
      router.push("/login");
      return;
    }

    setSession(s);

    const allHabits = getItem<Habit[]>(HABITS_KEY) || [];

    // only user habits
    const userHabits = allHabits.filter(
      (h) => h.userId === s.userId
    );

    setHabits(userHabits);
  }, [router]);

  // 🔁 TOGGLE COMPLETION
  function handleToggle(habit: Habit) {
    const updated = toggleHabitCompletion(habit, today);

    const allHabits = getItem<Habit[]>(HABITS_KEY) || [];

    const newHabits = allHabits.map((h) =>
      h.id === habit.id ? updated : h
    );

    setItem(HABITS_KEY, newHabits);

    setHabits(
      newHabits.filter((h) => h.userId === session?.userId)
    );
  }

  // 🧩 EMPTY STATE
  if (!habits.length) {
    return (
      <div data-testid="dashboard-page">
        <p data-testid="empty-state">No habits yet</p>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <h1>My Habits</h1>

    {habits.map((habit) => (
  <HabitCard
    key={habit.id}
    habit={habit}
    today={today}
    onUpdate={(updated) => {
      const allHabits = getItem<Habit[]>(HABITS_KEY) || [];

      const newHabits = allHabits.map((h) =>
        h.id === updated.id ? updated : h
      );

      setItem(HABITS_KEY, newHabits);

      setHabits(
        newHabits.filter((h) => h.userId === session?.userId)
      );
    }}
    onDelete={(id) => {
      const allHabits = getItem<Habit[]>(HABITS_KEY) || [];

      const newHabits = allHabits.filter((h) => h.id !== id);

      setItem(HABITS_KEY, newHabits);

      setHabits(
        newHabits.filter((h) => h.userId === session?.userId)
      );
    }}
  />
))}
    </div>
  );
}