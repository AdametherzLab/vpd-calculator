import type { ChartDataOptions, ChartDataPoint, TempUnit, VpdThresholds } from './types';
import { calculateVpd } from './calculator';

function validateRange(range: readonly [number, number, number], name: string): void {
  const [start, end, step] = range;
  if (start > end) {
    throw new RangeError(`${name} range start (${start}) must be ≤ end (${end})`);
  }
  if (step <= 0) {
    throw new RangeError(`${name} step (${step}) must be > 0`);
  }
}

function generateValues(start: number, end: number, step: number): number[] {
  const values: number[] = [];
  for (let value = start; value <= end + Number.EPSILON; value += step) {
    values.push(Number(value.toFixed(2)));
  }
  return values;
}

function fahrenheitToCelsius(f: number): number {
  return (f - 32) * 5 / 9;
}

export interface ChartData {
  readonly dataMatrix: ChartDataPoint[][];
  readonly tempUnit: TempUnit;
  readonly thresholds: VpdThresholds;
}

/**
 * Generates temperature vs humidity VPD matrix for visualization.
 * @param options - Range configuration and measurement units
 * @param thresholds - Ideal VPD ranges for growth stages
 * @returns Structured chart data with original units and thresholds
 * @throws {RangeError} On invalid temperature/humidity ranges
 * @example
 * const data = generateChartData(
 *   { tempRange: [20, 30, 1], humidityRange: [50, 80, 5], tempUnit: 'C' },
 *   { propagation: { min: 0.8, max: 1.2 }, veg: { min: 1.0, max: 1.5 }, flower: { min: 1.2, max: 1.8 } }
 * );
 */
export function generateChartData(
  options: ChartDataOptions,
  thresholds: VpdThresholds
): ChartData {
  validateRange(options.tempRange, 'Temperature');
  validateRange(options.humidityRange, 'Humidity');

  const temps = generateValues(...options.tempRange);
  const humidities = generateValues(...options.humidityRange);

  const dataMatrix: ChartDataPoint[][] = [];
  for (const temp of temps) {
    const row: ChartDataPoint[] = [];
    const tempC = options.tempUnit === 'F' ? fahrenheitToCelsius(temp) : temp;

    for (const humidity of humidities) {
      const { calculatedVpd } = calculateVpd(tempC, humidity);
      row.push({ temperature: temp, humidity, vpd: calculatedVpd });
    }

    dataMatrix.push(row);
  }

  return {
    dataMatrix,
    tempUnit: options.tempUnit,
    thresholds
  };
}