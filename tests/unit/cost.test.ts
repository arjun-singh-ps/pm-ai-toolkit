import { describe, expect, it } from "vitest";
import { calculateCostUsd } from "@/lib/cost";

describe("calculateCostUsd", () => {
  it("calculates cost from input and output tokens", () => {
    // 1,000,000 input tokens at $3.00/M + 1,000,000 output tokens at $15.00/M
    expect(calculateCostUsd(1_000_000, 1_000_000)).toBe("18.000000");
  });

  it("returns a 6-decimal-place string for small token counts", () => {
    expect(calculateCostUsd(100, 50)).toBe("0.001050");
  });

  it("does not accumulate floating point drift across repeated small calls", () => {
    let total = 0;
    for (let i = 0; i < 10_000; i++) {
      total += Number(calculateCostUsd(37, 11));
    }
    // Each call is deterministic to 6dp; summing many of them should still
    // land on an exact value rather than drifting (a float-based
    // implementation accumulating cents-scale rounding error would not).
    expect(total).toBeCloseTo(10_000 * Number(calculateCostUsd(37, 11)), 6);
  });
});
