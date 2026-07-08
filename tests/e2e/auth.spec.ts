// Auth flow tests.
// Uses the authenticated session created by global.setup.ts (storageState).
// The sign-out test must run last because it modifies the browser session.

import { test, expect } from "@playwright/test";

test("authenticated user sees the Programmes heading and Sign out button", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Programmes" })).toBeVisible();
  // The root layout renders the user's email and a "Sign out" button in the top nav.
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("authenticated user can navigate to Settings", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveURL("/settings");
});

test("sign out redirects to the login page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign out" }).click();

  // signOutAction redirects to /login
  await expect(page).toHaveURL("/login", { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
