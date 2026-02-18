import { describe, it, expect } from "vitest";
import { atterbergLimits, grainSizeAnalysis } from "../src/soil-index/index";

describe("Atterberg Limits", () => {
  it("should compute PI and chart position", () => {
    const r = atterbergLimits({ liquidLimit: 45, plasticLimit: 22 });
    expect(r.PI).toBe(23);
    expect(r.chartPosition).toBe("A-line above");
    expect(r.uscsGroup).toContain("CL");
  });

  it("high plasticity clay", () => {
    const r = atterbergLimits({ liquidLimit: 70, plasticLimit: 30 });
    expect(r.PI).toBe(40);
    expect(r.uscsGroup).toContain("CH");
  });

  it("silt — below A-line", () => {
    const r = atterbergLimits({ liquidLimit: 55, plasticLimit: 45 });
    expect(r.PI).toBe(10);
    expect(r.chartPosition).toBe("A-line below");
    expect(r.uscsGroup).toContain("MH");
  });

  it("should compute LI and CI with natural water content", () => {
    const r = atterbergLimits({ liquidLimit: 45, plasticLimit: 22, naturalWaterContent: 35 });
    expect(r.LI).toBeGreaterThan(0);
    expect(r.LI!).toBeLessThan(1);
    expect(r.CI).toBeGreaterThan(0);
    expect(r.consistencyState).toBeDefined();
  });

  it("should compute activity when clay percent given", () => {
    const r = atterbergLimits({ liquidLimit: 50, plasticLimit: 25, clayPercent: 30 });
    expect(r.activity).toBeCloseTo(25 / 30, 1);
  });
});

describe("Grain Size Analysis", () => {
  const data = [
    { sieveSize: 75, percentPassing: 100 },
    { sieveSize: 19, percentPassing: 95 },
    { sieveSize: 4.75, percentPassing: 80 },
    { sieveSize: 2, percentPassing: 65 },
    { sieveSize: 0.425, percentPassing: 40 },
    { sieveSize: 0.15, percentPassing: 20 },
    { sieveSize: 0.075, percentPassing: 12 },
    { sieveSize: 0.002, percentPassing: 3 },
  ];

  it("should compute D values", () => {
    const r = grainSizeAnalysis({ data });
    expect(r.D10).not.toBeNull();
    expect(r.D50).not.toBeNull();
    expect(r.D60).not.toBeNull();
    expect(r.D60!).toBeGreaterThan(r.D10!);
  });

  it("should compute Cu and Cc", () => {
    const r = grainSizeAnalysis({ data });
    expect(r.Cu).not.toBeNull();
    expect(r.Cu!).toBeGreaterThan(1);
    expect(r.Cc).not.toBeNull();
  });

  it("should compute fractions", () => {
    const r = grainSizeAnalysis({ data });
    expect(r.fractions.gravel).toBeGreaterThan(0);
    expect(r.fractions.sand).toBeGreaterThan(0);
    const total = r.fractions.gravel + r.fractions.sand + r.fractions.silt + r.fractions.clay;
    expect(total).toBeCloseTo(100, 0);
  });

  it("should handle insufficient data", () => {
    const r = grainSizeAnalysis({ data: [{ sieveSize: 4.75, percentPassing: 50 }] });
    expect(r.D10).toBeNull();
    expect(r.gradingDescription).toBe("Yetersiz veri");
  });
});
