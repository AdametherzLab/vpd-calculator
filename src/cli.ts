#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { calculateVpd, classifyVpdRange, getVpdThresholds } from "./vpd.js";
import { VpdStage } from "./types.js";
import type { VpdRange } from "./types.js";
import { startWebServer } from './web.js';

const RANGE_ICONS: Record<VpdRange, string> = {
  low: "[LOW]",
  optimal: "[OK]",
  high: "[HIGH]",
};

const STAGE_NAMES: Record<VpdStage, string> = {
  [VpdStage.Propagation]: "Propagation",
  [VpdStage.Veg]: "Vegetative",
  [VpdStage.Flower]: "Flowering",
};

function printHelp(): void {
  console.log(`vpd-calculator — Quick VPD lookup from your terminal or interactive web chart

Usage:
  vpd-calc --temp <celsius> --rh <percent> [--stage <stage>] [--unit <kpa|psi>]
  vpd-calc -t <celsius> -r <percent> [-s <stage>] [-u <kpa|psi>]
  vpd-calc --chart [--port <port>]
  vpd-calc -h, --help

Options:
  -t, --temp     Air temperature in Celsius (required for CLI calculation)
  -r, --rh       Relative humidity 0-100 (required for CLI calculation)
  -s, --stage    Growth stage: propagation, veg, flower (default: veg)
  -u, --unit     Output unit: kpa or psi (default: kpa)
  -a, --all      Show VPD for all growth stages (CLI only)
  --chart        Start an interactive web chart server
  --port         Port for the web chart server (default: 3000, with --chart)
  -h, --help     Show this help message

Examples:
  vpd-calc --temp 25 --rh 60
  vpd-calc -t 28 -r 55 -s flower
  vpd-calc -t 22 -r 70 --all
  vpd-calc -t 25 -r 60 -u psi
  vpd-calc --chart
  vpd-calc --chart --port 8080`);
}

function parseStage(value: string): VpdStage {
  const normalized = value.toLowerCase().trim();
  if (normalized === "propagation" || normalized === "prop") return VpdStage.Propagation;
  if (normalized === "veg" || normalized === "vegetative") return VpdStage.Veg;
  if (normalized === "flower" || normalized === "flowering" || normalized === "bloom") return VpdStage.Flower;
  throw new Error(`Unknown stage: "${value}". Use propagation, veg, or flower.`);
}

const KPA_TO_PSI = 0.14503773773;

function formatVpd(vpd: number, unit: string): string {
  if (unit === "psi") return `${(vpd * KPA_TO_PSI).toFixed(4)} psi`;
  return `${vpd.toFixed(3)} kPa`;
}

function printResult(temp: number, rh: number, stage: VpdStage, unit: string): void {
  const result = calculateVpd(temp, rh, stage);
  const thresholds = getVpdThresholds(stage);
  const icon = RANGE_ICONS[result.range];

  console.log(`  ${STAGE_NAMES[stage]}:  ${formatVpd(result.vpd, unit)}  ${icon}  (optimal: ${formatVpd(thresholds.low, unit)} – ${formatVpd(thresholds.high, unit)})`);
}

/** Parse CLI args and execute. Exported for testing. */
export function run(args: string[]): void {
  const { values } = parseArgs({
    args,
    options: {
      temp: { type: "string", short: "t" },
      rh: { type: "string", short: "r" },
      stage: { type: "string", short: "s", default: "veg" },
      unit: { type: "string", short: "u", default: "kpa" },
      all: { type: "boolean", short: "a", default: false },
      chart: { type: "boolean", default: false },
      port: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    printHelp();
    return;
  }

  if (values.chart) {
    const port = values.port ? parseInt(values.port) : undefined;
    if (port && (isNaN(port) || port < 1 || port > 65535)) {
      console.error(`Error: Invalid port number: "${values.port}". Port must be between 1 and 65535.`);
      process.exitCode = 1;
      return;
    }
    startWebServer(port);
    return;
  }

  if (!values.temp || !values.rh) {
    console.error("Error: --temp (-t) and --rh (-r) are required for CLI calculation. Use --help for usage or --chart for web interface.");
    process.exitCode = 1;
    return;
  }

  const temp = Number(values.temp);
  const rh = Number(values.rh);

  if (!Number.isFinite(temp)) {
    console.error(`Error: Invalid temperature value: "${values.temp}"`);
    process.exitCode = 1;
    return;
  }
  if (!Number.isFinite(rh)) {
    console.error(`Error: Invalid humidity value: "${values.rh}"`);
    process.exitCode = 1;
    return;
  }

  const unit = (values.unit ?? "kpa").toLowerCase();
  if (unit !== "kpa" && unit !== "psi") {
    console.error(`Error: Unknown unit "${values.unit}". Use kpa or psi.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nVPD Report — ${temp}°C / ${rh}% RH`);
  console.log("─".repeat(50));

  if (values.all) {
    for (const stage of [VpdStage.Propagation, VpdStage.Veg, VpdStage.Flower]) {
      printResult(temp, rh, stage, unit);
    }
  } else {
    const stage = parseStage(values.stage ?? "veg");
    printResult(temp, rh, stage, unit);
  }

  console.log("");
}

// Auto-run when executed directly
const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("cli.ts") || process.argv[1]?.endsWith("vpd-calc");
if (isMain) {
  run(process.argv.slice(2));
}
