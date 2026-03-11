import { app } from '../src/web';
import { VpdStage } from '../src/types';

describe('Thresholds API', () => {
  const testStage = VpdStage.Veg;

  test('GET /thresholds returns current thresholds', async () => {
    const res = await app.request('/thresholds');
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body[testStage]).toEqual({
      low: expect.any(Number),
      high: expect.any(Number)
    });
  });

  test('POST /thresholds updates thresholds', async () => {
    const newThresholds = { low: 1.3, high: 1.7 };
    const res = await app.request('/thresholds', {
      method: 'POST',
      body: JSON.stringify({ stage: testStage, ...newThresholds })
    });
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[testStage]).toEqual(newThresholds);
  });

  test('DELETE /thresholds resets to default', async () => {
    await app.request('/thresholds', {
      method: 'POST',
      body: JSON.stringify({ stage: testStage, low: 1.3, high: 1.7 })
    });
    
    const deleteRes = await app.request(`/thresholds/${testStage}`, {
      method: 'DELETE'
    });
    
    expect(deleteRes.status).toBe(200);
    const body = await deleteRes.json();
    expect(body[testStage].low).toBe(1.0);
  });
});