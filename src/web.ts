import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { VpdStage } from './types.js';
import { generateChartData } from './chart-data.js';
import { renderVpdChart } from './chart-renderer.js';

const app = new Hono();

/**
 * Serves static assets from the 'public' directory.
 */
app.use('/static/*', serveStatic({ root: './' }));

/**
 * Renders the main interactive chart page.
 */
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interactive VPD Chart</title>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        <style>
            body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
            h1 { color: #2c3e50; }
            .container { display: flex; flex-wrap: wrap; gap: 20px; max-width: 1200px; margin: 0 auto; }
            .controls { flex: 1; min-width: 300px; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .chart-area { flex: 2; min-width: 400px; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="range"], select { width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; }
            .input-group { margin-bottom: 15px; }
            .input-group span { float: right; font-weight: normal; }
            .error-message { color: red; margin-top: 10px; }
            img { max-width: 100%; height: auto; border: 1px solid #eee; border-radius: 4px; }
        </style>
    </head>
    <body>
        <h1>Interactive VPD Chart Generator</h1>
        <div class="container">
            <div class="controls">
                <h2>Chart Settings</h2>
                <div class="input-group">
                    <label for="stage">Growth Stage:</label>
                    <select id="stage" name="stage" hx-get="/chart" hx-trigger="change" hx-target="#chart-output" hx-swap="innerHTML">
                        <option value="propagation">Propagation</option>
                        <option value="veg" selected>Vegetative</option>
                        <option value="flower">Flowering</option>
                    </select>
                </div>

                <div class="input-group">
                    <label for="tempMinC">Min Temperature (°C): <span><output id="tempMinC-output">20</output></span></label>
                    <input type="range" id="tempMinC" name="tempMinC" min="0" max="40" value="20" step="1" oninput="document.getElementById('tempMinC-output').value=this.value" hx-get="/chart" hx-trigger="change" hx-target="#chart-output" hx-swap="innerHTML">
                </div>

                <div class="input-group">
                    <label for="tempMaxC">Max Temperature (°C): <span><output id="tempMaxC-output">30</output></span></label>
                    <input type="range" id="tempMaxC" name="tempMaxC" min="0" max="40" value="30" step="1" oninput="document.getElementById('tempMaxC-output').value=this.value" hx-get="/chart" hx-trigger="change" hx-target="#chart-output" hx-swap="innerHTML">
                </div>

                <div class="input-group">
                    <label for="tempStepC">Temperature Step (°C): <span><output id="tempStepC-output">1</output></span></label>
                    <input type="range" id="tempStepC" name="tempStepC" min="0.5" max="5" value="1" step="0.5" oninput="document.getElementById('tempStepC-output').value=this.value" hx-get="/chart" hx-trigger="change" hx-target="#chart-output" hx-swap="innerHTML">
                </div>

                <div class="input-group">
                    <label for="humidityMin">Min Humidity (%): <span><output id="humidityMin-output">40</output></span></label>
                    <input type="range" id="humidityMin" name="humidityMin" min="0" max="100" value="40" step="5" oninput="document.getElementById('humidityMin-output').value=this.value" hx-get="/chart" hx-trigger="change" hx-target="#chart-output" hx-swap="innerHTML">
                </div>

                <div class="input-group">
                    <label for="humidityMax">Max Humidity (%): <span><output id="humidityMax-output">80</output></span></label>
                    <input type="range" id="humidityMax" name="humidityMax" min="0" max="100" value="80" step="5" oninput="document.getElementById('humidityMax-output').value=this.value" hx-get="/chart" hx-trigger="change" hx-target="#chart-output" hx-swap="innerHTML">
                </div>

                <div class="input-group">
                    <label for="humidityStep">Humidity Step (%): <span><output id="humidityStep-output">5</output></span></label>
                    <input type="range" id="humidityStep" name="humidityStep" min="1" max="10" value="5" step="1" oninput="document.getElementById('humidityStep-output').value=this.value" hx-get="/chart" hx-trigger="change" hx-target="#chart-output" hx-swap="innerHTML">
                </div>
            </div>

            <div class="chart-area">
                <h2>VPD Chart</h2>
                <div id="chart-output" hx-get="/chart" hx-trigger="load" hx-swap="innerHTML">
                    <!-- Chart will be loaded here via HTMX -->
                    Loading chart...
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

/**
 * Endpoint to generate and return the VPD chart image.
 */
app.get('/chart', async (c) => {
  try {
    const query = c.req.query();

    const stage = (query.stage as VpdStage) || VpdStage.Veg;
    const tempMinC = parseFloat(query.tempMinC || '20');
    const tempMaxC = parseFloat(query.tempMaxC || '30');
    const tempStepC = parseFloat(query.tempStepC || '1');
    const humidityMin = parseFloat(query.humidityMin || '40');
    const humidityMax = parseFloat(query.humidityMax || '80');
    const humidityStep = parseFloat(query.humidityStep || '5');

    // Basic validation for ranges
    if (tempMinC >= tempMaxC) {
      return c.html(`<div class="error-message">Error: Min Temperature must be less than Max Temperature.</div>`);
    }
    if (humidityMin >= humidityMax) {
      return c.html(`<div class="error-message">Error: Min Humidity must be less than Max Humidity.</div>`);
    }
    if (tempStepC <= 0 || humidityStep <= 0) {
      return c.html(`<div class="error-message">Error: Step values must be greater than 0.</div>`);
    }

    const chartData = generateChartData({
      stage,
      tempMinC,
      tempMaxC,
      tempStepC,
      humidityMin,
      humidityMax,
      humidityStep,
    });

    const buffer = await renderVpdChart(chartData, { stage, width: 800, height: 600 });

    // Return the image as a base64 encoded string to embed directly in HTML
    const base64Image = buffer.toString('base64');
    return c.html(`<img src="data:image/png;base64,${base64Image}" alt="VPD Chart">`);
  } catch (error: any) {
    console.error('Error generating chart:', error);
    return c.html(`<div class="error-message">Error generating chart: ${error.message}</div>`);
  }
});

/**
 * Starts the web server.
 * @param port - The port to listen on.
 */
export function startWebServer(port: number = 3000) {
  console.log(`VPD Chart server running on http://localhost:${port}`);
  console.log('Access the interactive chart at /');
  console.log('Generate chart image directly at /chart?stage=veg&tempMinC=20&tempMaxC=30&humidityMin=40&humidityMax=80');
  return app.listen(port);
}

// If this file is run directly, start the server
if (import.meta.main) {
  startWebServer();
}
