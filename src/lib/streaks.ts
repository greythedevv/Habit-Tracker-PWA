export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  if (!completions.length) return 0;

  const currentDate = today || new Date().toISOString().slice(0, 10);

  // remove duplicates
  const uniqueDates = Array.from(new Set(completions));

  // sort dates descending (latest first)
  const sorted = uniqueDates.sort((a, b) => (a < b ? 1 : -1));

  // if today is not completed → streak = 0
  if (!sorted.includes(currentDate)) return 0;

  let streak = 0;
  let current = new Date(currentDate);

  for (let i = 0; i < sorted.length; i++) {
    const dateStr = current.toISOString().slice(0, 10);

    if (sorted.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}