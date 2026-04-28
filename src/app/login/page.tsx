import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-xl">
            🔥
          </div>
          <span className="text-2xl text-stone-900 font-serif">Habit Tracker</span>
        </div>

        <div className="card p-8">
          <h1 className="text-3xl text-stone-900 mb-1">Welcome back</h1>
          <p className="text-stone-400 text-sm mb-7">Log in to see your habits</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}