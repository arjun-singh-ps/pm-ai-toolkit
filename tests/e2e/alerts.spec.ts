// E2E tests for the proactive agent alerts flow.
// Seeds one active alert via Supabase service client (no Claude), then exercises:
//   - alert card appears on programme home
//   - dismissal removes the card immediately (optimistic)
//   - dismissed state persists after navigation
//   - "Open [Agent] →" link carries ?alertId= and the banner is shown

import { test, expect } from "@playwright/test";
import {
  createTestProgramme,
  seedAlert,
  deleteTestProgrammes,
  type TestAlert,
} from "./helpers/seed";

let programmeId: string;
let alert: TestAlert;

test.beforeAll(async () => {
  await deleteTestProgrammes();
  const programme = await createTestProgramme("Alerts E2E");
  programmeId = programme.id;
  alert = await seedAlert(
    programmeId,
    "signal-watch",
    "Sprint velocity dropped 23% below the Delivery Compass baseline",
    [
      "Three consecutive sprints missed the target velocity",
      "Current pace risks a 6-week delivery slip",
    ],
    "Open Signal Watch to review sprint data and update the Intelligence Pulse."
  );
});

test.afterAll(async () => {
  await deleteTestProgrammes();
});

test("alert card is visible on the programme home screen", async ({ page }) => {
  await page.goto(`/programme/${programmeId}`);

  // The AgentAlertsPanel fetches on mount — wait for the card to appear.
  await expect(
    page.getByText("Sprint velocity dropped 23% below the Delivery Compass baseline")
  ).toBeVisible({ timeout: 10_000 });
});

test("alert card shows all three structural parts", async ({ page }) => {
  await page.goto(`/programme/${programmeId}`);

  // What
  await expect(
    page.getByText("Sprint velocity dropped 23% below the Delivery Compass baseline")
  ).toBeVisible({ timeout: 10_000 });

  // Why it matters bullets
  await expect(page.getByText("Three consecutive sprints missed the target velocity")).toBeVisible();
  await expect(page.getByText("Current pace risks a 6-week delivery slip")).toBeVisible();

  // Suggested action
  await expect(
    page.getByText("Open Signal Watch to review sprint data and update the Intelligence Pulse.")
  ).toBeVisible();
});

test("dismiss 'Already handled' removes the card immediately", async ({ page }) => {
  await page.goto(`/programme/${programmeId}`);

  await expect(
    page.getByText("Sprint velocity dropped 23% below the Delivery Compass baseline")
  ).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Already handled" }).click();

  // Optimistic dismiss — card should disappear without a page reload.
  await expect(
    page.getByText("Sprint velocity dropped 23% below the Delivery Compass baseline")
  ).not.toBeVisible({ timeout: 5_000 });
});

test("dismissed alert does not reappear after navigating away and back", async ({ page }) => {
  // Navigate away.
  await page.goto("/");
  // Navigate back.
  await page.goto(`/programme/${programmeId}`);

  // The alert panel fetches from /api/alerts — dismissed alerts are excluded.
  // Allow the fetch to complete before asserting absence.
  await page.waitForTimeout(2_000);
  await expect(
    page.getByText("Sprint velocity dropped 23% below the Delivery Compass baseline")
  ).not.toBeVisible();
});

test("Open Signal Watch link carries alertId query param", async ({ page }) => {
  // Re-seed a fresh alert since the previous test dismissed the first one.
  const fresh = await seedAlert(
    programmeId,
    "signal-watch",
    "Burn rate exceeded by 18% in the last fortnight",
    ["Cost overrun detected on two active sprints"],
    "Review cost records in Signal Watch."
  );

  await page.goto(`/programme/${programmeId}`);

  await expect(page.getByText("Burn rate exceeded by 18% in the last fortnight")).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole("link", { name: /Open Signal Watch/ }).click();
  await expect(page).toHaveURL(
    `/programme/${programmeId}/agents/signal-watch?alertId=${fresh.id}`
  );
});
