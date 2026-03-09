import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { run } from "../src/cli.js";

describe("CLI — vpd-calc", () => {
  let logs: string[];
  let errors: string[];
  let logSpy: ReturnType<typeof spyOn>;
  let errorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    logs = [];
    errors = [];
    logSpy = spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    });
    errorSpy = spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    });
    process.exitCode = undefined;
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    process.exitCode = undefined;
  });

  it("calculates VPD for default veg stage", () => {
    run(["--temp", "25", "--rh", "60"]);
    const output = logs.join("\n");
    expect(output).toContain("25°C / 60% RH");
    expect(output).toContain("Vegetative");
    expect(output).toContain("kPa");
    expect(output).toMatch(/\[OK\]|\[LOW\]|\[HIGH\]/);
    expect(process.exitCode).toBeUndefined();
  });

  it("calculates VPD for flower stage with short flags", () => {
    run(["-t", "28", "-r", "55", "-s", "flower"]);
    const output = logs.join("\n");
    expect(output).toContain("28°C / 55% RH");
    expect(output).toContain("Flowering");
    expect(process.exitCode).toBeUndefined();
  });

  it("shows all stages with --all flag", () => {
    run(["--temp", "25", "--rh", "60", "--all"]);
    const output = logs.join("\n");
    expect(output).toContain("Propagation");
    expect(output).toContain("Vegetative");
    expect(output).toContain("Flowering");
    expect(process.exitCode).toBeUndefined();
  });

  it("converts to psi units", () => {
    run(["-t", "25", "-r", "60", "-u", "psi"]);
    const output = logs.join("\n");
    expect(output).toContain("psi");
    expect(output).not.toContain("kPa");
    expect(process.exitCode).toBeUndefined();
  });

  it("shows help with --help", () => {
    run(["--help"]);
    const output = logs.join("\n");
    expect(output).toContain("Usage:");
    expect(output).toContain("--temp");
    expect(output).toContain("--rh");
    expect(process.exitCode).toBeUndefined();
  });

  it("errors when --temp is missing", () => {
    run(["--rh", "60"]);
    expect(errors.join("\n")).toContain("--temp (-t) and --rh (-r) are required");
    expect(process.exitCode).toBe(1);
  });

  it("errors when --rh is missing", () => {
    run(["--temp", "25"]);
    expect(errors.join("\n")).toContain("--temp (-t) and --rh (-r) are required");
    expect(process.exitCode).toBe(1);
  });

  it("errors on invalid temperature", () => {
    run(["--temp", "abc", "--rh", "60"]);
    expect(errors.join("\n")).toContain("Invalid temperature");
    expect(process.exitCode).toBe(1);
  });

  it("errors on invalid humidity", () => {
    run(["--temp", "25", "--rh", "xyz"]);
    expect(errors.join("\n")).toContain("Invalid humidity");
    expect(process.exitCode).toBe(1);
  });

  it("errors on unknown unit", () => {
    run(["-t", "25", "-r", "60", "-u", "bar"]);
    expect(errors.join("\n")).toContain('Unknown unit');
    expect(process.exitCode).toBe(1);
  });

  it("errors on unknown stage", () => {
    expect(() => run(["-t", "25", "-r", "60", "-s", "seedling"])).toThrow("Unknown stage");
  });

  it("accepts stage aliases", () => {
    run(["-t", "25", "-r", "60", "-s", "prop"]);
    expect(logs.join("\n")).toContain("Propagation");

    logs.length = 0;
    run(["-t", "25", "-r", "60", "-s", "bloom"]);
    expect(logs.join("\n")).toContain("Flowering");

    logs.length = 0;
    run(["-t", "25", "-r", "60", "-s", "vegetative"]);
    expect(logs.join("\n")).toContain("Vegetative");
  });

  it("handles boundary temperature and humidity", () => {
    run(["-t", "0", "-r", "0"]);
    expect(process.exitCode).toBeUndefined();
    expect(logs.join("\n")).toContain("0°C / 0% RH");
  });
});
