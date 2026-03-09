# VPD Calculator 🌱

[![CI](https://github.com/AdametherzLab/vpd-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/vpd-calculator/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Accurate VPD calculation using Magnus formula
- Growth stage specific classifications (propagation/veg/flower)
- Chart-ready data matrix generation for visualization
- **CLI tool** for quick VPD lookup from your terminal
- Type-safe API with strict input validation
- Zero dependencies - pure TypeScript implementation

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

# Show all growth stages at once
vpd-calc -t 22 -r 70 --all

# Output in PSI instead of kPa
vpd-calc -t 25 -r 60 -u psi

# Stage aliases: prop, veg, vegetative, flower, flowering, bloom
vpd-calc -t 24 -r 65 -s bloom


Example output:


VPD Report — 25°C / 60% RH
──────────────────────────────────────────────────
  Vegetative:  1.268 kPa  [OK]  (optimal: 1.000 kPa – 1.500 kPa)


With `--all`:


VPD Report — 25°C / 60% RH
──────────────────────────────────────────────────
  Propagation:  1.268 kPa  [HIGH]  (optimal: 0.800 kPa – 1.000 kPa)
  Vegetative:   1.268 kPa  [OK]    (optimal: 1.000 kPa – 1.500 kPa)
  Flowering:    1.268 kPa  [OK]    (optimal: 1.200 kPa – 1.800 kPa)


## API Usage


import { VpdStage, calculateVpd, classifyVpdRange, getVpdThresholds, generateChartData } from '@adametherzlab/vpd-calculator';

// Calculate VPD for vegetative stage at 25°C / 60% RH
const result = calculateVpd(25, 60, VpdStage.Veg);
console.log(result); // { vpd: 1.268, range: 'optimal' }

// Get thresholds for a stage
const thresholds = getVpdThresholds(VpdStage.Flower);
console.log(thresholds); // { low: 1.2, high: 1.8 }

// Generate chart data matrix
const chart = generateChartData({
  stage: VpdStage.Veg,
  tempMinC: 20,
  tempMaxC: 30,
  tempStepC: 2,
  humidityMin: 40,
  humidityMax: 80,
  humidityStep: 10,
});
console.log(chart.points.length); // 30 data points


## API Reference

### `calculateVpd(temperature, humidity, stage): VpdResult`

Calculate vapor pressure deficit from temperature and humidity.

- `temperature` — Air temperature in Celsius (-50 to 70)
- `humidity` — Relative humidity percentage (0-100)
- `stage` — Growth stage (`VpdStage.Propagation | Veg | Flower`)
- Returns `{ vpd: number, range: 'low' | 'optimal' | 'high' }`

### `classifyVpdRange(vpd, stage): VpdRange`

Classify a VPD value against stage-specific thresholds.

### `getVpdThresholds(stage): VpdThresholds`

Get the optimal VPD range for a growth stage.

### `generateChartData(options): ChartData`

Generate a temperature × humidity matrix of VPD values for visualization.

## Growth Stage Thresholds (kPa)

| Stage | Low | Optimal | High |
|-------|-----|---------|------|
| Propagation | < 0.8 | 0.8 – 1.0 | > 1.0 |
| Vegetative | < 1.0 | 1.0 – 1.5 | > 1.5 |
| Flowering | < 1.2 | 1.2 – 1.8 | > 1.8 |

## License

MIT
