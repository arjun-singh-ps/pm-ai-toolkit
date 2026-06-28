import { describe, expect, it } from "vitest";
import { fillTemplate } from "@/lib/fillTemplate";

describe("fillTemplate", () => {
  it("substitutes every matching placeholder", () => {
    const result = fillTemplate("Hello {{name}}, status: {{status}}.", {
      name: "Programme A",
      status: "Amber",
    });

    expect(result).toBe("Hello Programme A, status: Amber.");
  });

  it("leaves unmatched placeholders untouched", () => {
    const result = fillTemplate("Owner: {{owner}}", {});

    expect(result).toBe("Owner: {{owner}}");
  });

  it("ignores values that have no matching placeholder", () => {
    const result = fillTemplate("Hello {{name}}", { name: "A", extra: "unused" });

    expect(result).toBe("Hello A");
  });
});
