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
export type VpdRange = "low" | "optimal" | "high";

/**
 * Result of VPD calculation with classification
 */
export interface VpdResult {
  /** Calculated vapor pressure deficit in kilopascals */
  readonly vpd: number;
  /** Classification relative to stage-specific thresholds */
  readonly range: VpdRange;
}

/**
 * VPD thresholds for a growth stage
 */
export interface VpdThresholds {
  readonly low: number;
  readonly high: number;
}

/**
 * Single data point in the VPD chart matrix
 */
export interface ChartDataPoint {
  readonly temperatureC: number;
  readonly humidityPercent: number;
  readonly vpd: number;
  readonly range: VpdRange;
}

/**
 * Configuration for generating VPD chart data
 */
export interface ChartDataOptions {
  readonly stage: VpdStage;
  readonly tempMinC: number;
  readonly tempMaxC: number;
  readonly tempStepC: number;
  readonly humidityMin: number;
  readonly humidityMax: number;
  readonly humidityStep: number;
}

/**
 * Generated chart data result
 */
export interface ChartData {
  readonly points: readonly ChartDataPoint[];
}
