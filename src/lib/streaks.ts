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

