// Add to existing imports
import { getActiveVpdThresholds, setVpdThresholds, resetVpdThresholds, getAllActiveThresholds } from './thresholds';

// Add new endpoints
app.get('/thresholds', (c) => {
  return c.json(getAllActiveThresholds());
});

app.post('/thresholds', async (c) => {
  const { stage, low, high } = await c.req.json();
  try {
    setVpdThresholds(stage, { low, high });
    return c.json(getAllActiveThresholds());
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.delete('/thresholds/:stage', (c) => {
  const stage = c.req.param('stage') as VpdStage;
  resetVpdThresholds(stage);
  return c.json(getAllActiveThresholds());
});

// Add threshold form to existing HTML
const thresholdFormHTML = `
<div class="threshold-controls">
  <h3>Custom VPD Thresholds</h3>
  <div hx-get="/thresholds" hx-trigger="load">
    <!-- Dynamically loaded thresholds -->
  </div>
</div>`;

// Insert thresholdFormHTML into main page template