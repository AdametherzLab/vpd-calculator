import type { VpdStage } from "./types.ts";

/**
 * Plant growth stages for VPD calculations
 */
export enum VpdStage {
  Propagation = "propagation",
  Veg = "veg",
  Flower = "flower",
}

/**
 * Classification of VPD value relative to ideal ranges
 */
export type VpdRange = "low" | "ideal" | "high";

/**
 * Result of VPD calculation with classification
 */
export interface VpdResult {
  /** Calculated vapor pressure deficit in kilopascals */
  readonly calculatedVpd: number;
  /** Classification relative to ideal ranges */
  readonly classification: VpdRange;
}

/**
 * Single data point in the VPD matrix chart
 */
export interface ChartDataPoint {
  readonly temperature: number;
  readonly humidity: number;
  readonly vpd: number;
}

/** Temperature measurement unit for chart data generation */
export type TempUnit = "C" | "F";

/**
 * Configuration options for generating VPD chart data
 */
export interface ChartDataOptions {
  /** Temperature range parameters [start, end, step] */
  readonly tempRange: readonly [number, number, number];
  /** Humidity range parameters [start, end, step] */
  readonly humidityRange: readonly [number, number, number];
  /** Temperature measurement unit */
  readonly tempUnit: TempUnit;
}

/**
 * Ideal VPD thresholds for each growth stage
 */
export interface VpdThresholds {
  readonly [VpdStage.Propagation]: { readonly min: number; readonly max: number };
  readonly [VpdStage.Veg]: { readonly min: number; readonly max: number };
  readonly [VpdStage.Flower]: { readonly min: number; readonly max: number };
}