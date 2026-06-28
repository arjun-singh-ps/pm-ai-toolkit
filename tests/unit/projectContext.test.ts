// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { getProjectContext, setProjectContext } from "@/lib/projectContext";

beforeEach(() => {
  window.localStorage.clear();
});

describe("projectContext", () => {
  it("returns an empty string when nothing has been saved", () => {
    expect(getProjectContext()).toBe("");
  });

  it("returns whatever was last saved", () => {
    setProjectContext("Core banking migration, Agile delivery, regulated environment.");

    expect(getProjectContext()).toBe(
      "Core banking migration, Agile delivery, regulated environment."
    );
  });

  it("overwrites the previous context on save", () => {
    setProjectContext("First context");
    setProjectContext("Second context");

    expect(getProjectContext()).toBe("Second context");
  });
});
