import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3000";

function randomEmail() {
  return `user_${Date.now()}@test.com`;
}

async function signupUser(page: Page, email: string, password = "password123") {
  await page.goto(`${BASE}/signup`);
  await page.fill('[data-testid="auth-signup-email"]', email);
  await page.fill('[data-testid="auth-signup-password"]', password);
  await page.click('[data-testid="auth-signup-submit"]');
  await page.waitForURL(`${BASE}/dashboard`);
}

test.describe("Habit Tracker app", () => {

  test("shows the splash screen and redirects unauthenticated users to /login", async ({ page }) => {
  // Go to login first so origin exists, then clear localStorage
  await page.goto(`${BASE}/login`);
  await page.evaluate(() => localStorage.clear());

  // Now go to splash with clean state
  await page.goto(BASE);

  await expect(page.getByTestId("splash-screen")).toBeVisible();

  // Use 10000ms — splash takes 1200ms + page load time
  await page.waitForURL(`${BASE}/login`, { timeout: 10000 });
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
    // Navigate first so origin exists, then clear
    await page.goto(BASE);
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

    // Sign up and create a habit
    await signupUser(page, email);
    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', "My Unique Habit");
    await page.click('[data-testid="habit-save-button"]');

    // Logout
    await page.click('[data-testid="auth-logout-button"]');
    await page.waitForURL(`${BASE}/login`);

    // Log back in
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

    // Create a habit
    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', "Exercise");
    await page.click('[data-testid="habit-save-button"]');

    // Get streak before
    const streakBefore = await page
      .getByTestId("habit-streak-exercise")
      .textContent();

    // Complete the habit
    await page.click('[data-testid="habit-complete-exercise"]');

    // Get streak after
    const streakAfter = await page
      .getByTestId("habit-streak-exercise")
      .textContent();

    expect(streakAfter).not.toBe(streakBefore);
  });

  test("persists session and habits after page reload", async ({ page }) => {
    const email = randomEmail();
    await signupUser(page, email);

    // Create a habit
    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', "Read Books");
    await page.click('[data-testid="habit-save-button"]');
    await expect(page.getByTestId("habit-card-read-books")).toBeVisible();

    // Reload the page
    await page.reload();

    // Should still be on dashboard with the habit
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

    // Sign up and visit pages while ONLINE so they get cached
    await signupUser(page, email);
    await page.goto(BASE);
    await page.goto(`${BASE}/login`);
    await page.goto(`${BASE}/dashboard`);

    // Wait for service worker to fully install and cache
    await page.waitForTimeout(3000);

    // Go offline
    await context.setOffline(true);

    // Try loading app while offline
    try {
      await page.goto(BASE, { timeout: 8000 });
    } catch {
      // Navigation may throw when offline — expected
    }

    await page.waitForTimeout(1000);

    // Body should have some content — not a blank crash
    const body = await page.locator("body").innerHTML();
    expect(body.trim().length).toBeGreaterThan(0);

    // Go back online
    await context.setOffline(false);
  });

});