# VPD Calculator 🌱

[![CI](https://github.com/AdametherzLab/vpd-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/vpd-calculator/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Accurate VPD calculation using Magnus formula
- Growth stage specific classifications (propagation/veg/flower)
- Chart-ready data matrix generation for visualization
- Type-safe API with strict input validation
- Zero dependencies - pure TypeScript implementation

## Installation

bash
npm install @adametherzlab/vpd-calculator
# or
bun add @adametherzlab/vpd-calculator


## Quick Start


import { VpdStage, calculateVpd, classifyVpdRange, getVpdThresholds, generateChartData } from '@adametherzlab/vpd-calculator';

// Calculate VPD for vegetative stage at 25°C / 60% RH
const result = calculateVpd(25, 60, VpdStage.Veg);
console.log(result); // { vpd: 1.268, range: 'optimal' }

// Get thresholds for a growth stage
const thresholds = getVpdThresholds(VpdStage.Flower);
console.log(thresholds); // { low: 1.2, high: 1.8 }

// Classify a known VPD value
const range = classifyVpdRange(0.9, VpdStage.Propagation);
console.log(range); // 'optimal'

// Generate chart data matrix
const chart = generateChartData({
  stage: VpdStage.Veg,
  tempMinC: 20,
  tempMaxC: 30,
  tempStepC: 1,
  humidityMin: 40,
  humidityMax: 80,
  humidityStep: 5,
});
console.log(chart.points.length); // 99 (11 temps × 9 humidities)


## API Reference

### `calculateVpd(temperature, humidity, stage)`

Calculates vapor pressure deficit from temperature and humidity.

| Parameter | Type | Description |
|-----------|------|-------------|
| `temperature` | `number` | Ambient temperature in °C (-50 to 70) |
| `humidity` | `number` | Relative humidity % (0–100) |
| `stage` | `VpdStage` | Growth stage for classification |

Returns `VpdResult` with `vpd` (kPa) and `range` (`'low'` \| `'optimal'` \| `'high'`).

### `classifyVpdRange(vpd, stage)`

Classifies a VPD value against stage-specific thresholds.

### `getVpdThresholds(stage)`

Returns `{ low, high }` thresholds (kPa) for the given growth stage.

### `generateChartData(options)`

Generates a temperature × humidity VPD matrix for chart visualization.

### Growth Stage Thresholds

| Stage | Low (kPa) | High (kPa) |
|-------|-----------|------------|
| Propagation | 0.8 | 1.0 |
| Veg | 1.0 | 1.5 |
| Flower | 1.2 | 1.8 |

### Types

- `VpdStage` — enum: `Propagation`, `Veg`, `Flower`
- `VpdRange` — `'low' | 'optimal' | 'high'`
- `VpdResult` — `{ vpd: number; range: VpdRange }`
- `VpdThresholds` — `{ low: number; high: number }`
- `ChartDataPoint` — `{ temperatureC, humidityPercent, vpd, range }`
- `ChartDataOptions` — chart generation configuration
- `ChartData` — `{ points: ChartDataPoint[] }`

## License

MIT
