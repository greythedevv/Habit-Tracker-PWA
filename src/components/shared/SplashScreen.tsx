export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-3xl shadow-lg">
        🔥
      </div>
      <h1 className="text-4xl text-stone-900">Habit Tracker</h1>
      <p className="text-stone-400 text-sm">Loading your habits…</p>
    </div>
  );
}