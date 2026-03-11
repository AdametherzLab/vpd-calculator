import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { startWebServer } from "../src/web.js";
import { Hono } from 'hono';

describe("Web Server", () => {
  let server: ReturnType<Hono['listen']>;
  const port = 3001; // Use a different port for tests
  const baseUrl = `http://localhost:${port}`;

  beforeAll(() => {
    server = startWebServer(port);
  });

  afterAll(() => {
    server.close();
  });

  it("should serve the interactive chart page on /", async () => {
    const response = await fetch(baseUrl);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("Interactive VPD Chart");
    expect(text).toContain("htmx.org");
    expect(text).toContain("Min Temperature");
  });

  it("should return a chart image for default parameters on /chart", async () => {
    const response = await fetch(`${baseUrl}/chart`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("data:image/png;base64,");
    expect(text).toContain("alt=\"VPD Chart\"");
  });

  it("should return a chart image for specific parameters on /chart", async () => {
    const params = new URLSearchParams({
      stage: "flower",
      tempMinC: "25",
      tempMaxC: "35",
      tempStepC: "2",
      humidityMin: "50",
      humidityMax: "70",
      humidityStep: "10",
    });
    const response = await fetch(`${baseUrl}/chart?${params.toString()}`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("data:image/png;base64,");
  });

  it("should return an error message for invalid temperature range", async () => {
    const params = new URLSearchParams({
      tempMinC: "30",
      tempMaxC: "20", // Invalid range
    });
    const response = await fetch(`${baseUrl}/chart?${params.toString()}`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("Error: Min Temperature must be less than Max Temperature.");
  });

  it("should return an error message for invalid humidity step", async () => {
    const params = new URLSearchParams({
      humidityStep: "0", // Invalid step
    });
    const response = await fetch(`${baseUrl}/chart?${params.toString()}`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("Error: Step values must be greater than 0.");
  });
});
