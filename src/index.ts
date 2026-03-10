import { VpdStage } from "./types.js";
export { VpdStage };

export type {
  VpdRange,
  VpdResult,
  VpdThresholds,
  ChartDataPoint,
  ChartDataOptions,
  ChartData,
} from "./types.js";

export {
  STAGE_THRESHOLDS,
  calculateVpd,
  classifyVpdRange,
  getVpdThresholds,
} from "./vpd.js";

export { generateChartData } from "./chart-data.js";
export { renderVpdChart } from "./chart-renderer.js";

// New exports for customizable thresholds
export {
  setVpdThresholds,
  resetVpdThresholds,
  getActiveVpdThresholds,
  hasCustomThresholds,
  getAllActiveThresholds,
  DEFAULT_STAGE_THRESHOLDS,
} from "./thresholds.js";
