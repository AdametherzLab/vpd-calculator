import { describe, it, expect, beforeEach } from "bun:test";
import {
  setVpdThresholds,
  resetVpdThresholds,
  getActiveVpdThresholds,
  hasCustomThresholds,
  getAllActiveThresholds,
  DEFAULT_STAGE_THRESHOLDS,
} from "../src/thresholds.ts";
import {
  calculateVpd,
  classifyVpdRange,
  getVpdThresholds,
} from "../src/vpd.ts";
import { VpdStage } from "../src/types.ts";

describe("Customizable VPD Thresholds", () => {
  // Reset all thresholds before each test to ensure clean state
  beforeEach(() => {
    resetVpdThresholds();
  });

  describe("setVpdThresholds", () => {
    it("sets custom thresholds for a specific stage", () => {
      const customThresholds = { low: 0.9, high: 1.4 };
      setVpdThresholds(VpdStage.Veg, customThresholds);

      const retrieved = getActiveVpdThresholds(VpdStage.Veg);
      expect(retrieved).toEqual(customThresholds);
      expect(hasCustomThresholds(VpdStage.Veg)).toBe(true);
    });

    it("throws TypeError for invalid stage", () => {
      expect(() => setVpdThresholds("invalid" as VpdStage, { low: 1.0, high: 1.5 }))
        .toThrow(TypeError);
      expect(() => setVpdThresholds("invalid" as VpdStage, { low: 1.0, high: 1.5 }))
        .toThrow("Invalid growth stage");
    });

    it("throws RangeError when low >= high", () => {
      expect(() => setVpdThresholds(VpdStage.Veg, { low: 1.5, high: 1.0 }))
        .toThrow(RangeError);
      expect(() => setVpdThresholds(VpdStage.Veg, { low: 1.5, high: 1.0 }))
        .toThrow("low");
    });

    it("throws RangeError when low equals high", () => {
      expect(() => setVpdThresholds(VpdStage.Veg, { low: 1.0, high: 1.0 }))
        .toThrow(RangeError);
    });

    it("throws RangeError for negative threshold values", () => {
      expect(() => setVpdThresholds(VpdStage.Veg, { low: -0.1, high: 1.0 }))
        .toThrow(RangeError);
      expect(() => setVpdThresholds(VpdStage.Veg, { low: 0.5, high: -1.0 }))
        .toThrow(RangeError);
    });

    it("throws TypeError for non-numeric threshold values", () => {
      expect(() => setVpdThresholds(VpdStage.Veg, { low: NaN, high: 1.0 }))
        .toThrow(TypeError);
      expect(() => setVpdThresholds(VpdStage.Veg, { low: 1.0, high: Infinity }))
        .toThrow(TypeError);
      expect(() => setVpdThresholds(VpdStage.Veg, { low: "0.5" as unknown as number, high: 1.0 }))
        .toThrow(TypeError);
    });

    it("creates a copy of thresholds object to prevent external mutation", () => {
      const customThresholds = { low: 0.9, high: 1.4 };
      setVpdThresholds(VpdStage.Veg, customThresholds);

      // Mutate original
      (customThresholds as { low: number }).low = 2.0;

      // Should not affect stored value
      const retrieved = getActiveVpdThresholds(VpdStage.Veg);
      expect(retrieved.low).toBe(0.9);
    });
  });

  describe("getActiveVpdThresholds", () => {
    it("returns default thresholds when no custom thresholds set", () => {
      const vegThresholds = getActiveVpdThresholds(VpdStage.Veg);
      expect(vegThresholds).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Veg]);
      expect(vegThresholds).toEqual({ low: 1.0, high: 1.5 });
    });

    it("returns custom thresholds when set", () => {
      setVpdThresholds(VpdStage.Flower, { low: 1.5, high: 2.0 });
      const flowerThresholds = getActiveVpdThresholds(VpdStage.Flower);
      expect(flowerThresholds).toEqual({ low: 1.5, high: 2.0 });
    });

    it("returns different thresholds for different stages independently", () => {
      setVpdThresholds(VpdStage.Veg, { low: 0.9, high: 1.4 });
      setVpdThresholds(VpdStage.Flower, { low: 1.5, high: 2.0 });

      expect(getActiveVpdThresholds(VpdStage.Veg)).toEqual({ low: 0.9, high: 1.4 });
      expect(getActiveVpdThresholds(VpdStage.Flower)).toEqual({ low: 1.5, high: 2.0 });
      expect(getActiveVpdThresholds(VpdStage.Propagation)).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Propagation]);
    });

    it("throws TypeError for invalid stage", () => {
      expect(() => getActiveVpdThresholds("invalid" as VpdStage))
        .toThrow(TypeError);
    });
  });

  describe("resetVpdThresholds", () => {
    it("resets specific stage to defaults", () => {
      setVpdThresholds(VpdStage.Veg, { low: 0.9, high: 1.4 });
      expect(hasCustomThresholds(VpdStage.Veg)).toBe(true);

      resetVpdThresholds(VpdStage.Veg);
      expect(hasCustomThresholds(VpdStage.Veg)).toBe(false);
      expect(getActiveVpdThresholds(VpdStage.Veg)).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Veg]);
    });

    it("resets all stages when called without argument", () => {
      setVpdThresholds(VpdStage.Veg, { low: 0.9, high: 1.4 });
      setVpdThresholds(VpdStage.Flower, { low: 1.5, high: 2.0 });

      resetVpdThresholds();

      expect(hasCustomThresholds(VpdStage.Veg)).toBe(false);
      expect(hasCustomThresholds(VpdStage.Flower)).toBe(false);
      expect(getActiveVpdThresholds(VpdStage.Veg)).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Veg]);
      expect(getActiveVpdThresholds(VpdStage.Flower)).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Flower]);
    });

    it("throws TypeError when resetting invalid stage", () => {
      expect(() => resetVpdThresholds("invalid" as VpdStage))
        .toThrow(TypeError);
    });
  });

  describe("hasCustomThresholds", () => {
    it("returns false for stages without custom thresholds", () => {
      expect(hasCustomThresholds(VpdStage.Veg)).toBe(false);
    });

    it("returns true for stages with custom thresholds", () => {
      setVpdThresholds(VpdStage.Veg, { low: 0.9, high: 1.4 });
      expect(hasCustomThresholds(VpdStage.Veg)).toBe(true);
    });
  });

  describe("getAllActiveThresholds", () => {
    it("returns all stages with default thresholds initially", () => {
      const all = getAllActiveThresholds();
      expect(all[VpdStage.Propagation]).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Propagation]);
      expect(all[VpdStage.Veg]).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Veg]);
      expect(all[VpdStage.Flower]).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Flower]);
    });

    it("returns mixed custom and default thresholds", () => {
      setVpdThresholds(VpdStage.Veg, { low: 0.9, high: 1.4 });
      const all = getAllActiveThresholds();
      expect(all[VpdStage.Veg]).toEqual({ low: 0.9, high: 1.4 });
      expect(all[VpdStage.Propagation]).toEqual(DEFAULT_STAGE_THRESHOLDS[VpdStage.Propagation]);
    });
  });

  describe("Integration with calculateVpd", () => {
    it("uses custom thresholds for classification in calculateVpd", () => {
      // First calculate with default thresholds (Veg: 1.0-1.5)
      // At 25°C, 60% RH, VPD is ~1.268 kPa, which is optimal for default veg (1.0-1.5)
      const defaultResult = calculateVpd(25, 60, VpdStage.Veg);
      expect(defaultResult.range).toBe("optimal");

      // Set stricter thresholds (0.9-1.1)
      setVpdThresholds(VpdStage.Veg, { low: 0.9, high: 1.1 });

      // Same conditions, but now 1.268 is "high"
      const customResult = calculateVpd(25, 60, VpdStage.Veg);
      expect(customResult.vpd).toBe(defaultResult.vpd); // VPD value unchanged
      expect(customResult.range).toBe("high"); // But classification changed
    });

    it("uses custom thresholds for classification in classifyVpdRange", () => {
      setVpdThresholds(VpdStage.Flower, { low: 1.5, high: 2.0 });

      // 1.3 kPa would normally be "low" for flower (default 1.2-1.8)
      // But with custom thresholds 1.5-2.0, it's still "low"
      expect(classifyVpdRange(1.3, VpdStage.Flower)).toBe("low");

      // 1.6 kPa would normally be "optimal" for flower
      // But with custom thresholds 1.5-2.0, it's "optimal"
      expect(classifyVpdRange(1.6, VpdStage.Flower)).toBe("optimal");

      // 2.1 kPa is "high" for both, but let's verify
      expect(classifyVpdRange(2.1, VpdStage.Flower)).toBe("high");
    });
  });

  describe("Integration with getVpdThresholds", () => {
    it("returns custom thresholds via getVpdThresholds after setting", () => {
      setVpdThresholds(VpdStage.Propagation, { low: 0.7, high: 0.9 });
      const thresholds = getVpdThresholds(VpdStage.Propagation);
      expect(thresholds).toEqual({ low: 0.7, high: 0.9 });
    });
  });

  describe("Edge cases", () => {
    it("handles very small threshold ranges", () => {
      setVpdThresholds(VpdStage.Veg, { low: 1.0, high: 1.001 });
      const thresholds = getActiveVpdThresholds(VpdStage.Veg);
      expect(thresholds.high - thresholds.low).toBeCloseTo(0.001, 3);
    });

    it("handles zero low threshold", () => {
      setVpdThresholds(VpdStage.Veg, { low: 0, high: 1.0 });
      const thresholds = getActiveVpdThresholds(VpdStage.Veg);
      expect(thresholds.low).toBe(0);
    });

    it("preserves custom thresholds across multiple get calls", () => {
      setVpdThresholds(VpdStage.Veg, { low: 0.8, high: 1.2 });
      expect(getActiveVpdThresholds(VpdStage.Veg)).toEqual({ low: 0.8, high: 1.2 });
      expect(getActiveVpdThresholds(VpdStage.Veg)).toEqual({ low: 0.8, high: 1.2 });
      expect(getVpdThresholds(VpdStage.Veg)).toEqual({ low: 0.8, high: 1.2 });
    });
  });
});
