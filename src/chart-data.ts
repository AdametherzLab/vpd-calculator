import type { ChartDataOptions, ChartDataPoint, ChartData } from "./types.js";
import { VpdStage } from "./types.js";
import { calculateVpd } from "./vpd.js";

/**
 * Generates temperature vs humidity VPD matrix for visualization.
 * @param options - Range configuration for chart generation
 * @returns Chart data with array of data points
 * @throws {RangeError} On invalid temperature/humidity ranges or step values
 * @throws {TypeError} On non-numeric inputs
 */
export function generateChartData(options: ChartDataOptions): ChartData {
  const { stage, tempMinC, tempMaxC, tempStepC, humidityMin, humidityMax, humidityStep } = options;

  if (typeof tempMinC !== "number" || !Number.isFinite(tempMinC)) {
    throw new TypeError(`tempMinC must be a finite number, received: ${String(tempMinC)}`);
  }
  if (typeof tempMaxC !== "number" || !Number.isFinite(tempMaxC)) {
    throw new TypeError(`tempMaxC must be a finite number, received: ${String(tempMaxC)}`);
  }
  if (typeof tempStepC !== "number" || !Number.isFinite(tempStepC)) {
    throw new TypeError(`tempStepC must be a finite number, received: ${String(tempStepC)}`);
  }
  if (typeof humidityMin !== "number" || !Number.isFinite(humidityMin)) {
    throw new TypeError(`humidityMin must be a finite number, received: ${String(humidityMin)}`);
  }
  if (typeof humidityMax !== "number" || !Number.isFinite(humidityMax)) {
    throw new TypeError(`humidityMax must be a finite number, received: ${String(humidityMax)}`);
  }
  if (typeof humidityStep !== "number" || !Number.isFinite(humidityStep)) {
    throw new TypeError(`humidityStep must be a finite number, received: ${String(humidityStep)}`);
  }

  if (tempMinC > tempMaxC) {
    throw new RangeError(`tempMinC (${tempMinC}) must be ≤ tempMaxC (${tempMaxC})`);
  }
  if (humidityMin > humidityMax) {
    throw new RangeError(`humidityMin (${humidityMin}) must be ≤ humidityMax (${humidityMax})`);
  }
  if (tempStepC <= 0) {
    throw new RangeError(`tempStepC must be > 0, received: ${tempStepC}`);
  }
  if (humidityStep <= 0) {
    throw new RangeError(`humidityStep must be > 0, received: ${humidityStep}`);
  }
  if (humidityMin < 0 || humidityMax > 100) {
    throw new RangeError(`Humidity range must be within 0-100, received: ${humidityMin}-${humidityMax}`);
  }

  const points: ChartDataPoint[] = [];

  for (let temp = tempMinC; temp <= tempMaxC + Number.EPSILON; temp += tempStepC) {
    const t = Number(temp.toFixed(2));
    for (let hum = humidityMin; hum <= humidityMax + Number.EPSILON; hum += humidityStep) {
      const h = Number(hum.toFixed(2));
      const result = calculateVpd(t, h, stage);
      points.push({
        temperatureC: t,
        humidityPercent: h,
        vpd: result.vpd,
        range: result.range,
      });
    }
  }

  return { points };
}
