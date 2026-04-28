"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit } from "@/types/habit";
import type { Session } from "@/types/auth";
import { toggleHabitCompletion } from "@/lib/habits";
import HabitForm from "@/components/habits/HabitForm";
import HabitCard from "@/components/habits/HabitCard";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("habit-tracker-session");
      const s: Session | null = raw ? JSON.parse(raw) : null;
      if (!s || !s.userId) { router.replace("/login"); return; }
      setSession(s);
      loadHabits(s.userId);
      setAuthChecked(true);
    } catch {
      router.replace("/login");
    }
  }, []);

  function loadHabits(userId: string) {
    try {
      const raw = localStorage.getItem("habit-tracker-habits");
      const all: Habit[] = raw ? JSON.parse(raw) : [];
      setHabits(all.filter((h) => h.userId === userId));
    } catch { setHabits([]); }
  }

  function saveAndReload(all: Habit[], userId: string) {
    localStorage.setItem("habit-tracker-habits", JSON.stringify(all));
    setHabits(all.filter((h) => h.userId === userId));
  }

  function handleToggle(habit: Habit) {
    const updated = toggleHabitCompletion(habit, today);
    const raw = localStorage.getItem("habit-tracker-habits");
    const all: Habit[] = raw ? JSON.parse(raw) : [];
    saveAndReload(all.map((h) => (h.id === habit.id ? updated : h)), session!.userId);
  }

  function handleUpdate(updated: Habit) {
    const raw = localStorage.getItem("habit-tracker-habits");
    const all: Habit[] = raw ? JSON.parse(raw) : [];
    saveAndReload(all.map((h) => (h.id === updated.id ? updated : h)), session!.userId);
    setEditingHabit(null);
  }

  function handleDelete(id: string) {
    const raw = localStorage.getItem("habit-tracker-habits");
    const all: Habit[] = raw ? JSON.parse(raw) : [];
    saveAndReload(all.filter((h) => h.id !== id), session!.userId);
  }

  function handleCreated(habit: Habit) {
    if (session) loadHabits(session.userId);
    setShowForm(false);
    setEditingHabit(null);
  }

  function handleLogout() {
    localStorage.removeItem("habit-tracker-session");
    router.replace("/login");
  }

  if (!authChecked) return null;

  const completedToday = habits.filter((h) => h.completions.includes(today)).length;

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-stone-50">

      {/* NAVBAR */}
      <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-base">
              🔥
            </div>
            <span className="text-lg text-stone-900">Habit Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-stone-400 mr-1">
              {session?.email}
            </span>
            <button
              data-testid="create-habit-button"
              onClick={() => { setShowForm(true); setEditingHabit(null); }}
              className="btn-primary px-3 py-2 text-xs"
            >
              + New Habit
            </button>
            <button
              data-testid="auth-logout-button"
              onClick={handleLogout}
              className="btn-ghost px-3 py-2 text-xs"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* PAGE TITLE + STATS */}
        <div className="mb-6">
          <h1 className="text-3xl text-stone-900 mb-1">My Habits</h1>
          {habits.length > 0 && (
            <p className="text-sm text-stone-400">
              {completedToday} of {habits.length} completed today
            </p>
          )}
        </div>

        {/* PROGRESS BAR */}
        {habits.length > 0 && (
          <div className="mb-6">
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedToday / habits.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* CREATE FORM */}
        {showForm && !editingHabit && (
          <div className="mb-6">
            <HabitForm
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* EDIT FORM */}
        {editingHabit && (
          <div className="mb-6">
            <HabitForm
              existingHabit={editingHabit}
              onCreated={handleUpdate}
              onCancel={() => setEditingHabit(null)}
            />
          </div>
        )}

        {/* EMPTY STATE */}
        {habits.length === 0 && (
          <div
            data-testid="empty-state"
            className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl bg-white"
          >
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl text-stone-800 mb-2">No habits yet</h2>
            <p className="text-stone-400 text-sm mb-6">
              Start building your first habit today.
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              + Create your first habit
            </button>
          </div>
        )}

        {/* HABITS LIST */}
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}
              onToggle={() => handleToggle(habit)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onEdit={() => { setEditingHabit(habit); setShowForm(false); }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}