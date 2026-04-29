# Habit Tracker PWA

A mobile-first Progressive Web App for building and tracking daily habits.
Built with Next.js App Router, React, TypeScript, and Tailwind CSS.
All data is stored locally in the browser via `localStorage` — no backend required.

---

## Project Overview

Habit Tracker lets you:
- Sign up and log in with email and password (local auth)
- Create, edit, and delete daily habits
- Mark habits complete for today and unmark them
- See a live current streak count per habit
- Reload the app and retain all your data
- Install the app to your home screen (PWA)
- Load the app shell offline after first visit

---

## Setup

**Prerequisites:** Node.js 18+, npm

```bash
git clone <https://github.com/greythedevv/Habit-Tracker-PWA.git>
cd habit-tracker
npm install
npx playwright install   # installs browsers for E2E tests
```

---

## Running the App

```bash
npm run dev     # starts at http://localhost:3000
npm run build   # production build
npm run start   # serve production build
```

---

## Running Tests

### All tests
```bash
npm test
```

### Unit tests only (with coverage)
```bash
npm run test:unit
```

### Integration tests only
```bash
npm run test:integration
```

### End-to-end tests only (requires app running)
```bash
npm run test:e2e
```

> The E2E tests use Playwright and require the app to be running on
> `http://localhost:3000`. If you have `webServer` configured in
> `playwright.config.ts` it will start automatically.

---

## Local Persistence Structure

All data lives in `localStorage` under three keys:

### `habit-tracker-users`
Array of registered users:
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "password": "plaintext",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

### `habit-tracker-session`
The active session, or `null` when logged out:
```json
{
  "userId": "uuid",
  "email": "user@example.com"
}
```

### `habit-tracker-habits`
Array of all habits across all users:
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Drink Water",
    "description": "8 glasses a day",
    "frequency": "daily",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "completions": ["2026-04-26", "2026-04-25"]
  }
]
```

`completions` holds unique `YYYY-MM-DD` strings.
The dashboard filters habits by `userId` so each user only sees their own.

---

## PWA Implementation

- **`public/manifest.json`** — declares the app name, icons, start URL,
  display mode (`standalone`), and theme colors so browsers offer
  "Add to Home Screen".
- **`public/sw.js`** — a service worker that caches the app shell on
  first load using the Cache API. On subsequent visits (including offline)
  the shell is served from cache, so the app never hard-crashes without
  a network connection.
- **Service worker registration** — happens inside a `useEffect` on the
  root `page.tsx` so it only runs client-side, avoiding SSR errors.
- **Icons** — `public/icons/icon-192.png` and `public/icons/icon-512.png`
  are referenced in the manifest.

---

## Trade-offs and Limitations

| Area | Decision | Reason |
|---|---|---|
| Auth | Local only, plain-text passwords | Stage requirement — no backend |
| Persistence | `localStorage` | Deterministic, synchronous, no network |
| Frequency | Only `daily` supported | Stage 3 scope |
| Offline | App shell only | Full data sync requires a backend |
| Passwords | Not hashed | Local-only; hashing would add no real security here |
| Multi-device | Not supported | `localStorage` is per-device |

---

## Test File Map

| File | What it verifies |
|---|---|
| `tests/unit/slug.test.ts` | `getHabitSlug` — lowercasing, hyphenation, special character removal, space collapsing |
| `tests/unit/validators.test.ts` | `validateHabitName` — empty input, 60-char limit, trimming |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` — empty list, today missing, consecutive days, duplicates, broken streaks |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` — adding, removing, no mutation, no duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup creates session, duplicate email error, login stores session, wrong credentials error |
| `tests/integration/habit-form.test.tsx` | Validation error, create habit, edit preserving immutable fields, delete confirmation, streak update on toggle |
| `tests/e2e/app.spec.ts` | Full user journeys: splash redirect, protected routes, signup, login, create habit, complete habit, persist on reload, logout, offline shell |

---

## Folder Structure

```
src/
  app/
    globals.css
    layout.tsx
    page.tsx              ← splash + redirect
    login/page.tsx
    signup/page.tsx
    dashboard/page.tsx
  components/
    auth/
      LoginForm.tsx
      SignupForm.tsx
    habits/
      HabitForm.tsx
      HabitList.tsx
      HabitCard.tsx
    shared/
      SplashScreen.tsx
      ProtectedRoute.tsx
  lib/
    auth.ts
    habits.ts
    storage.ts
    streaks.ts
    slug.ts
    validators.ts
    constants.ts
  types/
    auth.ts
    habit.ts
public/
  icons/
    icon-192.png
    icon-512.png
  manifest.json
  sw.js
tests/
  unit/
    slug.test.ts
    validators.test.ts
    streaks.test.ts
    habits.test.ts
  integration/
    auth-flow.test.tsx
    habit-form.test.tsx
  e2e/
    app.spec.ts
```
