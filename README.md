# VPD Calculator 🌱

[![CI](https://github.com/AdametherzLab/vpd-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/vpd-calculator/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Accurate VPD calculation using Magnus formula
- Growth stage specific classifications (propagation/veg/flower)
- Chart-ready data matrix generation for visualization
- **CLI tool** for quick VPD lookup from your terminal
- **Interactive Web Chart** to dynamically adjust parameters and visualize VPD
- Type-safe API with strict input validation
- Zero dependencies for core calculations - uses `chart.js` and `canvas` for chart rendering, `hono` for web server.

## Installation

bash
npm install @adametherzlab/vpd-calculator
# or
bun add @adametherzlab/vpd-calculator


## CLI Usage

After installing globally (or via `npx`):

bash
# Basic VPD calculation (defaults to veg stage)
vpd-calc --temp 25 --rh 60

# Specify growth stage
vpd-calc -t 28 -r 55 -s flower

# Show all stages
vpd-calc -t 22 -r 70 --all

# Output in PSI
vpd-calc -t 25 -r 60 -u psi

# Start the interactive web chart server
vpd-calc --chart

# Start the web chart server on a custom port
vpd-calc --chart --port 8080

# Get help
vpd-calc --help


## Interactive Web Chart

To start the interactive web chart, run:

bash
vpd-calc --chart


Then, open your browser to `http://localhost:3000` (or the custom port you specified). You can adjust temperature and humidity ranges using sliders and immediately see the updated VPD chart.

## Library Usage


import { calculateVpd, VpdStage, generateChartData, renderVpdChart, setVpdThresholds } from 'vpd-calculator';

// 1. Calculate VPD for specific conditions
const result = calculateVpd(25, 60, VpdStage.Veg);
console.log(`VPD: ${result.vpd} kPa, Range: ${result.range}`);
// Output: VPD: 1.268 kPa, Range: optimal

// 2. Generate data for a chart
const chartOptions = {
  stage: VpdStage.Flower,
  tempMinC: 20,
  tempMaxC: 30,
  tempStepC: 1,
  humidityMin: 40,
  humidityMax: 70,
  humidityStep: 5,
};
const chartData = generateChartData(chartOptions);
console.log(`Generated ${chartData.points.length} data points for the chart.`);

// 3. Render a chart to a PNG buffer (Node.js/Bun environment)
async function createChartImage() {
  const imageBuffer = await renderVpdChart(chartData, { stage: VpdStage.Flower, width: 800, height: 600 });
  // imageBuffer is a Node.js Buffer containing PNG data
  // You can save it to a file, send it as an HTTP response, etc.
  // require('fs').writeFileSync('vpd_chart.png', imageBuffer);
  console.log('Chart image generated.');
}
createChartImage();

// 4. Customize VPD thresholds
setVpdThresholds(VpdStage.Propagation, { low: 0.7, high: 0.9 });
const customResult = calculateVpd(22, 75, VpdStage.Propagation);
console.log(`Custom VPD for Propagation: ${customResult.vpd} kPa, Range: ${customResult.range}`);

// Reset to default thresholds
// resetVpdThresholds(VpdStage.Propagation);


## API

### `calculateVpd(temperature: number, humidity: number, stage: VpdStage): VpdResult`
Calculates the Vapor Pressure Deficit (VPD) in kilopascals (kPa) for given temperature and humidity, and classifies it based on the specified growth stage's thresholds.

### `classifyVpdRange(vpd: number, stage: VpdStage): VpdRange`
Classifies a given VPD value ('low', 'optimal', 'high') based on the thresholds for the specified growth stage.

### `getVpdThresholds(stage: VpdStage): VpdThresholds`
Retrieves the active VPD thresholds (low and high kPa values) for a given growth stage. Returns custom thresholds if set, otherwise defaults.

### `setVpdThresholds(stage: VpdStage, thresholds: VpdThresholds): void`
Sets custom VPD thresholds for a specific growth stage, overriding the defaults. These will be used in subsequent calculations and classifications.

### `resetVpdThresholds(stage?: VpdStage): void`
Resets custom VPD thresholds for a specific stage to its default values. If no stage is provided, all custom thresholds are reset.

### `generateChartData(options: ChartDataOptions): ChartData`
Generates a matrix of VPD data points across specified temperature and humidity ranges, suitable for charting.

### `renderVpdChart(chartData: ChartData, options: ChartRenderOptions): Promise<Buffer>`
(Node.js/Bun only) Renders the generated `ChartData` into a PNG image buffer using `chart.js` and `canvas`.

### Types

- `VpdStage`: Enum for plant growth stages (`Propagation`, `Veg`, `Flower`).
- `VpdRange`: Type for VPD classification (`'low'`, `'optimal'`, `'high'`).
- `VpdResult`: Interface `{ vpd: number; range: VpdRange; }`.
- `VpdThresholds`: Interface `{ low: number; high: number; }`.
- `ChartDataPoint`: Interface `{ temperatureC: number; humidityPercent: number; vpd: number; range: VpdRange; }`.
- `ChartDataOptions`: Interface for `generateChartData` options.
- `ChartData`: Interface `{ points: readonly ChartDataPoint[]; }`.
- `ChartRenderOptions`: Interface for `renderVpdChart` options.

## Development

To run tests:

bash
bun test


To build:

bash
npm run build

