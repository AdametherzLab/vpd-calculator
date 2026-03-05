# VPD Calculator 🌱

[![CI](https://github.com/AdametherzLab/vpd-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/AdametherzLab/vpd-calculator/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features ✅

- 🌡️ Accurate VPD calculation using Magnus formula
- 🌱 Growth stage specific classifications (propagation/veg/flower)
- 📈 Chart-ready data matrix generation for visualization
- 🛠️ Type-safe API with strict input validation
- 📦 Zero dependencies - pure TypeScript implementation

## Installation

```bash
npm install @adametherzlab/vpd-calculator
# or
bun add @adametherzlab/vpd-calculator
```

## Quick Start

```typescript
// REMOVED external import: import { VpdStage, calculateVpd, classifyVpdRange } from '@adametherzlab/vpd-calculator';

// Calculate VPD for vegetative stage at 25°C / 60% RH
const result = calculateVpd(25, 60, VpdStage.Veg);
console.log(result);
// Output: { vpd: 1.12, stage: 'veg', range: 'ideal' }

// Classify existing VPD value
const status = classifyVpdRange(1.8, VpdStage.Flower);
console.log(status); // 'high'
```

## API Reference 🧩

### `calculateVpd(temperature: number, humidity: number, stage: VpdStage): VpdResult`
**Parameters:**
- `temperature` (°C): 0-50 range
- `humidity` (%): 0-100 range
- `stage`: Growth phase from VpdStage enum

**Returns:**
```typescript
{
  vpd: number;    // Calculated kPa value
  stage: VpdStage; 
  range: 'low' | 'ideal' | 'high'
}
```

**Throws:**
- `RangeError` for humidity outside 0-100
- `TypeError` for non-numeric inputs

---

### `classifyVpdRange(vpd: number, stage: VpdStage): VpdRange`
**Parameters:**
- `vpd`: Calculated kPa value
- `stage`: Growth stage to evaluate against

**Returns:**  
'low' | 'ideal' | 'high' classification

---

### `getVpdThresholds(stage: VpdStage): VpdThresholds`
```typescript
// Example: Get flower stage thresholds
const { min, max } = getVpdThresholds(VpdStage.Flower);
// { min: 1.2, max: 1.8 }
```

---

### `generateChartData(options: ChartDataOptions, thresholds: VpdThresholds): ChartData`
Generates temperature/humidity matrix for visualization.

**Options:**
```typescript
{
  tempRange: [min: number, max: number, step: number];
  humidityRange: [min: number, max: number, step: number];
  tempUnit: 'C' | 'F';  // Default: 'C'
}
```

**Output Structure:**
```typescript
{
  datasets: {
    temp: number[];
    humidity: number[];
    matrix: number[][]; // VPD values [temp][humidity]
  };
  thresholds: VpdThresholds;
  units: {
    temp: string;
    humidity: string;
  };
}
```

## VPD Ideal Ranges 🌿

| Growth Stage   | Min kPa | Max kPa |
|----------------|---------|---------|
| Propagation    | 0.8     | 1.2     |
| Vegetative     | 1.0     | 1.5     |
| Flower         | 1.2     | 1.8     |

## Advanced Usage Example 🌡️📊

```typescript
// REMOVED external import: import { generateChartData, VpdStage } from '@adametherzlab/vpd-calculator';

// Generate data matrix for 20-30°C at 5% humidity steps
const chartData = generateChartData(
  {
    tempRange: [20, 30, 0.5],
    humidityRange: [40, 70, 5],
    tempUnit: 'C'
  },
  {
    propagation: { min: 0.8, max: 1.2 },
    veg: { min: 1.0, max: 1.5 },
    flower: { min: 1.2, max: 1.8 }
  }
);

// Integrate with charting library (example using Plotly.js)
const heatmapTrace = {
  z: chartData.datasets.matrix,
  x: chartData.datasets.humidity,
  y: chartData.datasets.temp,
  type: 'heatmap',
  colorscale: 'Viridis'
};

Plotly.newPlot('vpd-chart', [heatmapTrace]);
```

## Formula & Methodology 🔬

Uses Magnus-Tetens formula for saturation vapor pressure:
```
SVP = 0.61094 * exp((17.625 * T) / (T + 243.04))
```
Where T = temperature in Celsius. VPD calculated as:
```
VPD = SVP * (1 - RH/100)
```

Formula based on [Alduchov & Eskridge (1996)](https://doi.org/10.1175/1520-0450(1996)035%3C0601:IMFAOS%3E2.0.CO;2) improvements to Magnus equation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © [AdametherzLab](https://github.com/AdametherzLab)