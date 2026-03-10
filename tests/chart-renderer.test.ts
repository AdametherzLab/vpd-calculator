import { describe, it, expect } from "bun:test";
import { renderVpdChart } from "../src/chart-renderer.js";
import { generateChartData } from "../src/chart-data.js";
import { VpdStage } from "../src/types.js";

describe("Chart Renderer", () => {
  it("should render a chart as a PNG buffer for propagation stage", async () => {
    const chartData = generateChartData({
      stage: VpdStage.Propagation,
      tempMinC: 20,
      tempMaxC: 25,
      tempStepC: 1,
      humidityMin: 60,
      humidityMax: 80,
      humidityStep: 5,
    });

    const buffer = await renderVpdChart(chartData, { stage: VpdStage.Propagation, width: 400, height: 300 });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // Check for PNG magic number (first 8 bytes)
    expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  });

  it("should render a chart as a PNG buffer for veg stage", async () => {
    const chartData = generateChartData({
      stage: VpdStage.Veg,
      tempMinC: 22,
      tempMaxC: 27,
      tempStepC: 1,
      humidityMin: 50,
      humidityMax: 70,
      humidityStep: 5,
    });

    const buffer = await renderVpdChart(chartData, { stage: VpdStage.Veg, width: 600, height: 450, title: "Vegetative VPD" });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  });

  it("should render a chart as a PNG buffer for flower stage", async () => {
    const chartData = generateChartData({
      stage: VpdStage.Flower,
      tempMinC: 24,
      tempMaxC: 29,
      tempStepC: 1,
      humidityMin: 40,
      humidityMax: 60,
      humidityStep: 5,
    });

    const buffer = await renderVpdChart(chartData, { stage: VpdStage.Flower });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  });

  it("should handle empty chart data gracefully", async () => {
    const chartData = { points: [] };
    const buffer = await renderVpdChart(chartData, { stage: VpdStage.Veg });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should use default width and height if not provided", async () => {
    const chartData = generateChartData({
      stage: VpdStage.Veg,
      tempMinC: 25,
      tempMaxC: 25,
      tempStepC: 1,
      humidityMin: 60,
      humidityMax: 60,
      humidityStep: 1,
    });
    const buffer = await renderVpdChart(chartData, { stage: VpdStage.Veg });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
