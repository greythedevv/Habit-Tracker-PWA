/**
 * CURRENT STREAK
 * Counts consecutive days up to today
 */
export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  if (!completions.length) return 0;

  const currentDate = today || new Date().toISOString().slice(0, 10);
  const set = new Set(completions);

  // must have completed today or streak is 0
  if (!set.has(currentDate)) return 0;

  let streak = 0;
  let date = new Date(currentDate);

  while (true) {
    const dateStr = date.toISOString().slice(0, 10);

    if (set.has(dateStr)) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * LONGEST STREAK
 * Finds best ever consecutive run
 */
export function calculateLongestStreak(completions: string[]): number {
  if (!completions.length) return 0;

  const set = new Set(completions);
  const sorted = Array.from(set).sort();

  let longest = 0;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    const diff =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }

  return Math.max(longest, current);
}

/**
 * TODAY STATUS
 * Checks if user completed habit today
 */
export function getTodayCompletionStatus(
  completions: string[],
  today?: string
): boolean {
  const currentDate = today || new Date().toISOString().slice(0, 10);
  return completions.includes(currentDate);
}