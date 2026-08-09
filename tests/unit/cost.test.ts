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

  it("defaults cache creation/read tokens to zero, matching pre-caching cost", () => {
    expect(calculateCostUsd(1_000_000, 1_000_000)).toBe(
      calculateCostUsd(1_000_000, 1_000_000, 0, 0)
    );
  });

  it("prices a cache write at 1.25x the base input rate", () => {
    // 1,000,000 cache-creation tokens at $3.75/M, no other tokens
    expect(calculateCostUsd(0, 0, 1_000_000, 0)).toBe("3.750000");
  });

  it("prices a cache read at 0.1x the base input rate", () => {
    // 1,000,000 cache-read tokens at $0.30/M, no other tokens
    expect(calculateCostUsd(0, 0, 0, 1_000_000)).toBe("0.300000");
  });

  it("blends all four token categories into one total", () => {
    // 100 in ($0.0003) + 50 out ($0.00075) + 100 cache write ($0.000375) + 100 cache read ($0.00003)
    expect(calculateCostUsd(100, 50, 100, 100)).toBe("0.001455");
  });
});
