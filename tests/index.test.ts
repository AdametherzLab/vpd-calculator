import { describe, it, expect } from "bun:test";
import {
  VpdStage,
  calculateVpd,
  classifyVpdRange,
  generateChartData,
  getVpdThresholds,
} from "../src/index.ts";

describe("VPD Calculator", () => {
  it("calculates correct VPD values and classifications", () => {
    const vegResult = calculateVpd(25, 60, VpdStage.Veg);
    expect(vegResult.vpd).toBeCloseTo(1.268, 2);
    expect(vegResult.range).toBe("optimal");

    const saturatedResult = calculateVpd(30, 100, VpdStage.Flower);
    expect(saturatedResult.vpd).toBe(0);
    expect(saturatedResult.range).toBe("low");
  });

  it("classifies VPD ranges against stage thresholds", () => {
    const vegThresholds = getVpdThresholds(VpdStage.Veg);
    expect(classifyVpdRange(vegThresholds.low - 0.1, VpdStage.Veg)).toBe("low");
    expect(classifyVpdRange((vegThresholds.low + vegThresholds.high) / 2, VpdStage.Veg)).toBe("optimal");
    expect(classifyVpdRange(vegThresholds.high + 0.1, VpdStage.Veg)).toBe("high");
  });

  it("generates chart data with valid structure and dimensions", () => {
    const data = generateChartData({
      stage: VpdStage.Propagation,
      tempMinC: 22,
      tempMaxC: 24,
      tempStepC: 1,
      humidityMin: 70,
      humidityMax: 80,
      humidityStep: 5,
    });

    expect(data.points.length).toBe(3 * 3); // 3 temps x 3 humidity
    expect(data.points[0]).toMatchObject({
      temperatureC: expect.any(Number),
      humidityPercent: expect.any(Number),
      vpd: expect.any(Number),
      range: expect.stringMatching(/low|optimal|high/),
    });
  });

  it("throws errors for invalid humidity values", () => {
    expect(() => calculateVpd(25, 105, VpdStage.Veg)).toThrow("Humidity must be between 0 and 100");
    expect(() => calculateVpd(25, -5, VpdStage.Veg)).toThrow("Humidity must be between 0 and 100");
  });

  it("returns correct thresholds for each growth stage", () => {
    expect(getVpdThresholds(VpdStage.Propagation)).toEqual({ low: 0.8, high: 1.0 });
    expect(getVpdThresholds(VpdStage.Veg)).toEqual({ low: 1.0, high: 1.5 });
    expect(getVpdThresholds(VpdStage.Flower)).toEqual({ low: 1.2, high: 1.8 });
  });
});