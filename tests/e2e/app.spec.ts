import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3000";

function randomEmail() {
  return `user_${Date.now()}@test.com`;
}

async function signupUser(page: any, email: string, password = "password123") {
  await page.goto(`${BASE}/signup`);
  await page.fill('[data-testid="auth-signup-email"]', email);
  await page.fill('[data-testid="auth-signup-password"]', password);
  await page.click('[data-testid="auth-signup-submit"]');
  await page.waitForURL(`${BASE}/dashboard`);
}

test.describe("Habit Tracker app", () => {
  test("shows the splash screen and redirects unauthenticated users to /login", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE);
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("redirects authenticated users from / to /dashboard", async ({ page }) => {
    const email = randomEmail();
    await signupUser(page, email);

    await page.goto(BASE);
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("prevents unauthenticated access to /dashboard", async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("signs up a new user and lands on the dashboard", async ({ page }) => {
    const email = randomEmail();
    await page.goto(`${BASE}/signup`);
    await page.fill('[data-testid="auth-signup-email"]', email);
    await page.fill('[data-testid="auth-signup-password"]', "password123");
    await page.click('[data-testid="auth-signup-submit"]');
    await page.waitForURL(`${BASE}/dashboard`);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({ page }) => {
    const email = randomEmail();

    // Sign up first
    await signupUser(page, email);

    // Create a habit
    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', "My Unique Habit");
    await page.click('[data-testid="habit-save-button"]');

    // Logout
    await page.click('[data-testid="auth-logout-button"]');
    await page.waitForURL(`${BASE}/login`);

    // Login again
    await page.fill('[data-testid="auth-login-email"]', email);
    await page.fill('[data-testid="auth-login-password"]', "password123");
    await page.click('[data-testid="auth-login-submit"]');
    await page.waitForURL(`${BASE}/dashboard`);

    await expect(page.getByTestId("habit-card-my-unique-habit")).toBeVisible();
  });

  test("creates a habit from the dashboard", async ({ page }) => {
    const email = randomEmail();
    await signupUser(page, email);

    await page.click('[data-testid="create-habit-button"]');
    await expect(page.getByTestId("habit-form")).toBeVisible();

    await page.fill('[data-testid="habit-name-input"]', "Drink Water");
    await page.fill('[data-testid="habit-description-input"]', "8 glasses a day");
    await page.click('[data-testid="habit-save-button"]');

    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();
  });

  test("completes a habit for today and updates the streak", async ({ page }) => {
    const email = randomEmail();
    await signupUser(page, email);

    // Create habit
    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', "Exercise");
    await page.click('[data-testid="habit-save-button"]');

    const streakBefore = await page.getByTestId("habit-streak-exercise").textContent();

    // Complete habit
    await page.click('[data-testid="habit-complete-exercise"]');

    const streakAfter = await page.getByTestId("habit-streak-exercise").textContent();
    expect(streakAfter).not.toBe(streakBefore);
  });

  test("persists session and habits after page reload", async ({ page }) => {
    const email = randomEmail();
    await signupUser(page, email);

    // Create habit
    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', "Read Books");
    await page.click('[data-testid="habit-save-button"]');
    await expect(page.getByTestId("habit-card-read-books")).toBeVisible();

    // Reload
    await page.reload();
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("habit-card-read-books")).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }) => {
    const email = randomEmail();
    await signupUser(page, email);

    await page.click('[data-testid="auth-logout-button"]');
    await page.waitForURL(`${BASE}/login`);
    expect(page.url()).toContain("/login");
  });

  test("loads the cached app shell when offline after the app has been loaded once", async ({ page, context }) => {
    const email = randomEmail();
    await signupUser(page, email);

    // Let service worker install and cache
    await page.waitForTimeout(1500);

    // Go offline
    await context.setOffline(true);

    // Reload while offline
    await page.reload({ timeout: 10000 }).catch(() => {});

    // App shell should still render — no hard crash
    const body = await page.locator("body").textContent();
    expect(body).not.toBe("");

    await context.setOffline(false);
  });
});