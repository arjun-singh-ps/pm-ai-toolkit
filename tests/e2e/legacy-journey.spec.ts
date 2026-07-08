// End-to-end test for the Modernising Legacy Foundation → Forge journey.
//
// Strategy: seed all Foundation artefacts as approved directly via the
// Supabase service client (no chat, no Claude). This keeps the test fast and
// deterministic while exercising the real gate logic and phase-advance API.

import { test, expect, type Page } from "@playwright/test";
import {
  createTestProgramme,
  seedFoundationArtefactsApproved,
  deleteTestProgrammes,
  type TestProgramme,
} from "./helpers/seed";

let programme: TestProgramme;

test.beforeAll(async () => {
  // Clean up any leftovers from a previous interrupted run.
  await deleteTestProgrammes();

  programme = await createTestProgramme("Foundation Journey");

  // Seed all 14 Foundation artefacts as approved so the phase gate is clear.
  // The test user email doesn't matter for approval logic — we use a sentinel.
  await seedFoundationArtefactsApproved(programme.id, "e2e-test@example.com");
});

test.afterAll(async () => {
  await deleteTestProgrammes();
});

async function goToProgramme(page: Page): Promise<void> {
  await page.goto(`/programme/${programme.id}`);
  // Wait for the sidebar to render (server component).
  await expect(page.getByText("Modernising Legacy Journey")).toBeVisible({ timeout: 10_000 });
}

test("programme shell loads with Foundation phase in the sidebar", async ({ page }) => {
  await goToProgramme(page);

  // Sidebar shows the active phase label.
  await expect(page.getByText("foundation", { exact: true })).toBeVisible();

  // Scope Sprint is the first agent — it has no dependencies so it's always a clickable link.
  await expect(page.getByRole("link", { name: "Scope Sprint" })).toBeVisible();
});

test("all four cross-cutting agent buttons are in the header", async ({ page }) => {
  await goToProgramme(page);

  // These links live in the programme shell header (not the sidebar).
  await expect(page.getByRole("link", { name: "Governance Guardian" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cost Compass" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Roadmap Architect" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Comms Architect" })).toBeVisible();
});

test("Gate tab shows phase gate clear because all Foundation artefacts are approved", async ({
  page,
}) => {
  await goToProgramme(page);

  // Switch to the Gate tab in the right panel.
  await page.getByRole("button", { name: "Gate" }).click();

  // With all 14 artefacts approved the gate should be clear.
  await expect(page.getByText("✅ Phase gate clear")).toBeVisible({ timeout: 10_000 });

  // The advance button must be enabled (not disabled) — the programme has a Forge phase.
  const advanceButton = page.getByRole("button", { name: "Advance to Forge" });
  await expect(advanceButton).toBeVisible();
  await expect(advanceButton).toBeEnabled();
});

test("Advance to Forge moves the programme into the Forge phase", async ({ page }) => {
  await goToProgramme(page);

  // Click Gate tab, then advance.
  await page.getByRole("button", { name: "Gate" }).click();
  await expect(page.getByText("✅ Phase gate clear")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Advance to Forge" }).click();

  // The route handler calls router.refresh() — the server-rendered sidebar re-renders.
  // After the refresh, the sidebar should show 'forge' as the active phase.
  await expect(page.getByText("forge", { exact: true })).toBeVisible({ timeout: 15_000 });

  // Forge's first agent is Pilot Ignition (no dependencies — always clickable).
  await expect(page.getByRole("link", { name: "Pilot Ignition" })).toBeVisible();
});

test("Artefacts tab lists the seeded Foundation artefacts", async ({ page }) => {
  await goToProgramme(page);

  // The Artefacts tab is shown by default; the seeded artefacts must appear.
  await expect(page.getByText("Programme Charter")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Modernisation Blueprint")).toBeVisible();
  await expect(page.getByText("Delivery Backlog")).toBeVisible();
});
