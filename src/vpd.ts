import type { VpdStage, VpdRange, VpdResult, VpdThresholds } from './types';

/** Ideal VPD thresholds (kPa) for each growth stage */
export const STAGE_THRESHOLDS: VpdThresholds = {
  [VpdStage.Propagation]: { min: 0.4, max: 0.8 },
  [VpdStage.Veg]: { min: 0.8, max: 1.2 },
  [VpdStage.Flower]: { min: 1.2, max: 1.6 }
} as const;

function calculateSaturationVaporPressure(temperature: number): number {
  if (temperature > 0) {
    return 0.61094 * Math.exp((17.625 * temperature) / (temperature + 243.04));
  }
  return 0.61094 * Math.exp((22.587 * temperature) / (temperature + 273.86));
}

function calculateActualVaporPressure(saturationVp: number, humidity: number): number {
  return saturationVp * (humidity / 100);
}

/**
 * Calculate vapor pressure deficit (VPD) from temperature and humidity
 * @param temperature - Ambient temperature in Celsius
 * @param humidity - Relative humidity percentage (0-100)
 * @param stage - Growth stage for threshold comparison
 * @returns VpdResult with calculated kPa and classification
 * @throws {TypeError} For non-numeric or infinite inputs
 * @throws {RangeError} If humidity outside 0-100 range
 * @example
 * const result = calculateVpd(25, 60, VpdStage.Veg);
 */
export function calculateVpd(
  temperature: number,
  humidity: number,
  stage: VpdStage
): VpdResult {
  if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
    throw new TypeError(`Invalid temperature: ${temperature}. Must be finite number`);
  }
  if (typeof humidity !== 'number' || !Number.isFinite(humidity)) {
    throw new TypeError(`Invalid humidity: ${humidity}. Must be finite number`);
  }
  if (humidity < 0 || humidity > 100) {
    throw new RangeError(`Humidity must be 0-100%, received: ${humidity}`);
  }

  const svp = calculateSaturationVaporPressure(temperature);
  const avp = calculateActualVaporPressure(svp, humidity);
  const calculatedVpd = Math.max(svp - avp, 0); // Prevent negative values from fp errors

  return {
    calculatedVpd: Number(calculatedVpd.toFixed(3)), // Limit to 3 decimal places
    classification: classifyVpdRange(calculatedVpd, stage)
  };
}

/**
 * Classify VPD value against stage-specific thresholds
 * @param vpd - Calculated vapor pressure deficit in kPa
 * @param stage - Growth stage to compare against
 * @returns 'low' | 'ideal' | 'high' classification
 * @example
 * const status = classifyVpdRange(1.1, VpdStage.Veg);
 */
export function classifyVpdRange(vpd: number, stage: VpdStage): VpdRange {
  const { min, max } = STAGE_THRESHOLDS[stage];
  
  if (vpd < min) return 'low';
  if (vpd > max) return 'high';
  return 'ideal';
}

/**
 * Retrieve ideal VPD thresholds for a growth stage
 * @param stage - Target growth stage
 * @returns Threshold object with min/max kPa values
 * @example
 * const { min, max } = getVpdThresholds(VpdStage.Flower);
 */
export function getVpdThresholds(stage: VpdStage): { readonly min: number; readonly max: number } {
  return STAGE_THRESHOLDS[stage];
}