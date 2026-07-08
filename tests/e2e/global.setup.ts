// Runs once before all E2E tests: logs in with a real Supabase account via
// the login form and saves the authenticated browser session to disk. All
// test specs then load that session via storageState, so no test needs its
// own login step.
//
// Requires TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local.

import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const SESSION_FILE = "tests/e2e/.auth/session.json";

setup("authenticate once", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local before running E2E tests."
    );
  }

  // Ensure the directory exists before Playwright tries to write the file.
  fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true });

  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for the successful redirect to the home page.
  await expect(page).toHaveURL("/", { timeout: 15_000 });

  // Persist cookies + localStorage so subsequent tests start authenticated.
  await page.context().storageState({ path: SESSION_FILE });
});
