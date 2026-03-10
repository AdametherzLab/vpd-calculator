import { VpdStage, VpdThresholds } from "./types.js";

/**
 * Storage for custom VPD thresholds per growth stage.
 * Uses a Map to allow undefined (fallback to defaults) vs explicitly set values.
 */
const customThresholds = new Map<VpdStage, VpdThresholds>();

/**
 * Default VPD thresholds (kPa) for each growth stage.
 * These are used when no custom thresholds are set.
 */
export const DEFAULT_STAGE_THRESHOLDS: Record<VpdStage, VpdThresholds> = {
  [VpdStage.Propagation]: { low: 0.8, high: 1.0 },
  [VpdStage.Veg]: { low: 1.0, high: 1.5 },
  [VpdStage.Flower]: { low: 1.2, high: 1.8 },
} as const;

/**
 * Validate threshold values
 * @throws {TypeError} If thresholds are not valid numbers
 * @throws {RangeError} If low >= high or if values are negative
 */
function validateThresholds(thresholds: VpdThresholds): void {
  if (typeof thresholds.low !== "number" || !Number.isFinite(thresholds.low)) {
    throw new TypeError(`Threshold 'low' must be a finite number, received: ${String(thresholds.low)}`);
  }
  if (typeof thresholds.high !== "number" || !Number.isFinite(thresholds.high)) {
    throw new TypeError(`Threshold 'high' must be a finite number, received: ${String(thresholds.high)}`);
  }
  if (thresholds.low < 0 || thresholds.high < 0) {
    throw new RangeError(`Threshold values must be non-negative, received: low=${thresholds.low}, high=${thresholds.high}`);
  }
  if (thresholds.low >= thresholds.high) {
    throw new RangeError(`Threshold 'low' (${thresholds.low}) must be less than 'high' (${thresholds.high})`);
  }
}

/**
 * Set custom VPD thresholds for a specific growth stage.
 * These thresholds will override the defaults for all subsequent VPD calculations
 * and classifications for that stage until reset.
 *
 * @param stage - The growth stage to set thresholds for
 * @param thresholds - The custom low/high threshold values in kPa
 * @throws {TypeError} If stage is invalid or thresholds are not finite numbers
 * @throws {RangeError} If low >= high or values are negative
 *
 * @example
 * 
 * setVpdThresholds(VpdStage.Veg, { low: 0.9, high: 1.4 });
 * 
 */
export function setVpdThresholds(stage: VpdStage, thresholds: VpdThresholds): void {
  if (!Object.values(VpdStage).includes(stage)) {
    throw new TypeError(`Invalid growth stage: ${String(stage)}`);
  }
  validateThresholds(thresholds);
  customThresholds.set(stage, { ...thresholds });
}

/**
 * Get the currently active VPD thresholds for a stage.
 * Returns custom thresholds if set, otherwise returns defaults.
 *
 * @param stage - The growth stage to get thresholds for
 * @returns The active thresholds (custom or default)
 * @throws {TypeError} If stage is invalid
 */
export function getActiveVpdThresholds(stage: VpdStage): VpdThresholds {
  if (!Object.values(VpdStage).includes(stage)) {
    throw new TypeError(`Invalid growth stage: ${String(stage)}`);
  }
  return customThresholds.get(stage) ?? DEFAULT_STAGE_THRESHOLDS[stage];
}

/**
 * Check if custom thresholds have been set for a specific stage.
 *
 * @param stage - The growth stage to check
 * @returns True if custom thresholds are set, false if using defaults
 */
export function hasCustomThresholds(stage: VpdStage): boolean {
  return customThresholds.has(stage);
}

/**
 * Reset thresholds to defaults for a specific stage or all stages.
 *
 * @param stage - Optional specific stage to reset. If omitted, resets all stages.
 *
 * @example
 * 
 * // Reset only veg stage to defaults
 * resetVpdThresholds(VpdStage.Veg);
 *
 * // Reset all stages to defaults
 * resetVpdThresholds();
 * 
 */
export function resetVpdThresholds(stage?: VpdStage): void {
  if (stage !== undefined) {
    if (!Object.values(VpdStage).includes(stage)) {
      throw new TypeError(`Invalid growth stage: ${String(stage)}`);
    }
    customThresholds.delete(stage);
  } else {
    customThresholds.clear();
  }
}

/**
 * Get all currently active thresholds (custom where set, defaults elsewhere).
 *
 * @returns Record of all stages with their current threshold values
 */
export function getAllActiveThresholds(): Record<VpdStage, VpdThresholds> {
  return {
    [VpdStage.Propagation]: getActiveVpdThresholds(VpdStage.Propagation),
    [VpdStage.Veg]: getActiveVpdThresholds(VpdStage.Veg),
    [VpdStage.Flower]: getActiveVpdThresholds(VpdStage.Flower),
  };
}
