// Playwright E2E test configuration.
// Tests run against a locally running Next.js dev server.
// Auth state is created once in global.setup.ts and reused across all tests.
//
// Required env vars (add to .env.local — never commit):
//   TEST_USER_EMAIL    — email of an existing Supabase user
//   TEST_USER_PASSWORD — that user's password
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — already in .env.local

import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

// Load .env.local so seed helpers in the test runner process can access
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
config({ path: ".env.local" });

export default defineConfig({
  testDir: "./tests/e2e",
  // Run tests sequentially to avoid concurrent writes to shared test data.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["html", { outputFolder: "tests/e2e/report", open: "never" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // Step 1: log in once and save the session to disk.
    {
      name: "setup",
      testMatch: "**/global.setup.ts",
    },
    // Step 2: all spec files run with the saved session already active.
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/session.json",
      },
      dependencies: ["setup"],
    },
  ],

  // Start the Next.js dev server before running any tests.
  // reuseExistingServer: true in local dev so `npm run dev` doesn't restart.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
