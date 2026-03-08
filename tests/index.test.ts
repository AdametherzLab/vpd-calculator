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

describe("Error handling — calculateVpd", () => {
  it("throws TypeError for NaN temperature", () => {
    expect(() => calculateVpd(NaN, 50, VpdStage.Veg)).toThrow(TypeError);
    expect(() => calculateVpd(NaN, 50, VpdStage.Veg)).toThrow("Temperature must be a finite number");
  });

  it("throws TypeError for Infinity humidity", () => {
    expect(() => calculateVpd(25, Infinity, VpdStage.Veg)).toThrow(TypeError);
    expect(() => calculateVpd(25, -Infinity, VpdStage.Veg)).toThrow("Humidity must be a finite number");
  });

  it("throws TypeError for non-number inputs", () => {
    expect(() => calculateVpd("25" as unknown as number, 50, VpdStage.Veg)).toThrow(TypeError);
    expect(() => calculateVpd(25, "50" as unknown as number, VpdStage.Veg)).toThrow(TypeError);
  });

  it("throws TypeError for invalid growth stage", () => {
    expect(() => calculateVpd(25, 50, "invalid" as VpdStage)).toThrow(TypeError);
    expect(() => calculateVpd(25, 50, "invalid" as VpdStage)).toThrow("Invalid growth stage");
  });

  it("throws RangeError for temperature outside -50 to 70°C", () => {
    expect(() => calculateVpd(-51, 50, VpdStage.Veg)).toThrow(RangeError);
    expect(() => calculateVpd(71, 50, VpdStage.Veg)).toThrow(RangeError);
    expect(() => calculateVpd(-51, 50, VpdStage.Veg)).toThrow("Temperature must be between -50 and 70");
  });

  it("handles boundary values correctly", () => {
    expect(() => calculateVpd(0, 0, VpdStage.Veg)).not.toThrow();
    expect(() => calculateVpd(0, 100, VpdStage.Veg)).not.toThrow();
    expect(() => calculateVpd(-50, 50, VpdStage.Veg)).not.toThrow();
    expect(() => calculateVpd(70, 50, VpdStage.Veg)).not.toThrow();
  });
});

describe("Error handling — classifyVpdRange", () => {
  it("throws TypeError for NaN vpd", () => {
    expect(() => classifyVpdRange(NaN, VpdStage.Veg)).toThrow(TypeError);
  });

  it("throws TypeError for invalid stage", () => {
    expect(() => classifyVpdRange(1.0, "" as VpdStage)).toThrow(TypeError);
  });
});

describe("Error handling — getVpdThresholds", () => {
  it("throws TypeError for invalid stage", () => {
    expect(() => getVpdThresholds("bloom" as VpdStage)).toThrow(TypeError);
    expect(() => getVpdThresholds("bloom" as VpdStage)).toThrow("Invalid growth stage");
  });
});

describe("Error handling — generateChartData", () => {
  it("throws RangeError when tempMin > tempMax", () => {
    expect(() =>
      generateChartData({
        stage: VpdStage.Veg,
        tempMinC: 30,
        tempMaxC: 20,
        tempStepC: 1,
        humidityMin: 50,
        humidityMax: 80,
        humidityStep: 5,
      })
    ).toThrow(RangeError);
  });

  it("throws RangeError when humidityMin > humidityMax", () => {
    expect(() =>
      generateChartData({
        stage: VpdStage.Veg,
        tempMinC: 20,
        tempMaxC: 30,
        tempStepC: 1,
        humidityMin: 90,
        humidityMax: 50,
        humidityStep: 5,
      })
    ).toThrow(RangeError);
  });

  it("throws RangeError for zero or negative step", () => {
    expect(() =>
      generateChartData({
        stage: VpdStage.Veg,
        tempMinC: 20,
        tempMaxC: 30,
        tempStepC: 0,
        humidityMin: 50,
        humidityMax: 80,
        humidityStep: 5,
      })
    ).toThrow(RangeError);

    expect(() =>
      generateChartData({
        stage: VpdStage.Veg,
        tempMinC: 20,
        tempMaxC: 30,
        tempStepC: 1,
        humidityMin: 50,
        humidityMax: 80,
        humidityStep: -1,
      })
    ).toThrow(RangeError);
  });

  it("throws RangeError for humidity outside 0-100", () => {
    expect(() =>
      generateChartData({
        stage: VpdStage.Veg,
        tempMinC: 20,
        tempMaxC: 30,
        tempStepC: 1,
        humidityMin: -10,
        humidityMax: 80,
        humidityStep: 5,
      })
    ).toThrow(RangeError);
  });

  it("throws TypeError for NaN chart options", () => {
    expect(() =>
      generateChartData({
        stage: VpdStage.Veg,
        tempMinC: NaN,
        tempMaxC: 30,
        tempStepC: 1,
        humidityMin: 50,
        humidityMax: 80,
        humidityStep: 5,
      })
    ).toThrow(TypeError);
  });
});
