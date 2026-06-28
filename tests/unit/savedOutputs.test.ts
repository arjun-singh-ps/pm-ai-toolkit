// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { getLastSaved, saveLastOutput } from "@/lib/savedOutputs";

beforeEach(() => {
  window.localStorage.clear();
});

describe("savedOutputs", () => {
  it("returns null when nothing has been saved for a slug", () => {
    expect(getLastSaved("raid-log")).toBeNull();
  });

  it("saves and retrieves the output with a timestamp", () => {
    const record = saveLastOutput("raid-log", "Risk: ...");

    expect(record.output).toBe("Risk: ...");
    expect(record.savedAt).toBeTruthy();
    expect(getLastSaved("raid-log")).toEqual(record);
  });

  it("keeps saved outputs for different slugs separate", () => {
    saveLastOutput("raid-log", "RAID output");
    saveLastOutput("status-report", "Status output");

    expect(getLastSaved("raid-log")?.output).toBe("RAID output");
    expect(getLastSaved("status-report")?.output).toBe("Status output");
  });

  it("overwrites the previous save for the same slug", () => {
    saveLastOutput("raid-log", "First");
    saveLastOutput("raid-log", "Second");

    expect(getLastSaved("raid-log")?.output).toBe("Second");
  });
});
