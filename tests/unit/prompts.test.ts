import { describe, expect, it } from "vitest";
import { getAllTemplates, getTemplateBySlug } from "@/lib/prompts";

describe("getAllTemplates", () => {
  it("loads every template in prompts/, sorted alphabetically by title", () => {
    const templates = getAllTemplates();

    expect(templates.map((template) => template.title)).toEqual([
      "Change Request Generator",
      "Governance Pack Summary Generator",
      "Lessons Learned Generator",
      "Project Charter Summary Generator",
      "RAID Log Entry Generator",
      "Stakeholder Communication Generator",
      "Steering Committee Update Generator",
      "Weekly Status Report Generator",
    ]);
  });

  it("parses variables from frontmatter", () => {
    const templates = getAllTemplates();
    const raidLog = templates.find((template) => template.slug === "raid-log");

    expect(raidLog?.variables).toEqual([
      { name: "entry_type", label: "Entry type (Risk / Assumption / Issue / Dependency)" },
      { name: "situation", label: "Describe the situation in plain English" },
      { name: "owner", label: "Owner / accountable person" },
    ]);
  });
});

describe("getTemplateBySlug", () => {
  it("returns the matching template", () => {
    const template = getTemplateBySlug("raid-log");

    expect(template?.title).toBe("RAID Log Entry Generator");
  });

  it("returns null for an unknown slug", () => {
    expect(getTemplateBySlug("does-not-exist")).toBeNull();
  });
});
