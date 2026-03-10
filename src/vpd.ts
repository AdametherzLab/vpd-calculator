import { VpdStage } from "./types.js";
import type { VpdRange, VpdResult, VpdThresholds } from "./types.js";
import { getActiveVpdThresholds } from "./thresholds.js";

/** Valid VpdStage values for runtime validation */
const VALID_STAGES = new Set<string>([
  VpdStage.Propagation,
  VpdStage.Veg,
  VpdStage.Flower,
]);

/**
 * Ideal VPD thresholds (kPa) for each growth stage.
 * @deprecated Use getVpdThresholds() to respect custom thresholds, or import DEFAULT_STAGE_THRESHOLDS from thresholds.js
 */
export const STAGE_THRESHOLDS: Record<VpdStage, VpdThresholds> = {
  [VpdStage.Propagation]: { low: 0.8, high: 1.0 },
  [VpdStage.Veg]: { low: 1.0, high: 1.5 },
  [VpdStage.Flower]: { low: 1.2, high: 1.8 },
} as const;

/**
 * Validate that a value is a finite number
 * @throws {TypeError} If value is not a finite number
 */
function assertFiniteNumber(value: unknown, name: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(
      `${name} must be a finite number, received: ${String(value)} (${typeof value})`
    );
  }
}

/**
 * Validate that a stage is a valid VpdStage enum value
 * @throws {TypeError} If stage is not a valid VpdStage
 */
function assertValidStage(stage: unknown): asserts stage is VpdStage {
  if (typeof stage !== "string" || !VALID_STAGES.has(stage)) {
    throw new TypeError(
      `Invalid growth stage: ${String(stage)}. Must be one of: ${[...VALID_STAGES].join(", ")}`
    );
  }
}

function calculateSaturationVaporPressure(temperature: number): number {
  if (temperature > 0) {
    return 0.61094 * Math.exp((17.625 * temperature) / (temperature + 243.04));
  }
  return 0.61094 * Math.exp((22.587 * temperature) / (temperature + 273.86));
}

/**
 * Calculate vapor pressure deficit (VPD) from temperature and humidity
 * @param temperature - Ambient temperature in Celsius
 * @param humidity - Relative humidity percentage (0-100)
 * @param stage - Growth stage for threshold comparison
 * @returns VpdResult with calculated kPa and classification
 * @throws {TypeError} For non-numeric, NaN, or Infinity inputs
 * @throws {RangeError} If humidity outside 0-100 range
 * @throws {RangeError} If temperature outside -50 to 70°C range
 */
export function calculateVpd(
  temperature: number,
  humidity: number,
  stage: VpdStage
): VpdResult {
  assertFiniteNumber(temperature, "Temperature");
  assertFiniteNumber(humidity, "Humidity");
  assertValidStage(stage);

  if (humidity < 0 || humidity > 100) {
    throw new RangeError(
      `Humidity must be between 0 and 100, received: ${humidity}`
    );
  }
  if (temperature < -50 || temperature > 70) {
    throw new RangeError(
      `Temperature must be between -50 and 70°C, received: ${temperature}`
    );
  }

  const svp = calculateSaturationVaporPressure(temperature);
  const avp = svp * (humidity / 100);
  const vpd = Math.max(svp - avp, 0);

  return {
    vpd: Number(vpd.toFixed(3)),
    range: classifyVpdRange(vpd, stage),
  };
}

/**
 * Classify VPD value against stage-specific thresholds
 * @param vpd - Calculated vapor pressure deficit in kPa
 * @param stage - Growth stage to compare against
 * @returns 'low' | 'optimal' | 'high' classification
 * @throws {TypeError} If vpd is not a finite number
 * @throws {TypeError} If stage is not a valid VpdStage
 */
export function classifyVpdRange(vpd: number, stage: VpdStage): VpdRange {
  assertFiniteNumber(vpd, "VPD");
  assertValidStage(stage);

  const { low, high } = getVpdThresholds(stage);
  if (vpd < low) return "low";
  if (vpd > high) return "high";
  return "optimal";
}

/**
 * Retrieve ideal VPD thresholds for a growth stage.
 * Returns custom thresholds if set, otherwise returns defaults.
 *
 * @param stage - Target growth stage
 * @returns Threshold object with low/high kPa values
 * @throws {TypeError} If stage is not a valid VpdStage
 */
export function getVpdThresholds(stage: VpdStage): VpdThresholds {
  assertValidStage(stage);
  return getActiveVpdThresholds(stage);
}
