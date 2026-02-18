import { describe, it, expect } from "vitest";
import { soilPhaseRelations, proctorAnalysis } from "../src/soil-basics/index";

describe("Soil Phase Relations", () => {
  it("from_ratios — should compute all unit weights", () => {
    const r = soilPhaseRelations({ mode: "from_ratios", voidRatio: 0.7, saturation: 80, Gs: 2.65 });
    expect(r.voidRatio).toBe(0.7);
    expect(r.porosity).toBeGreaterThan(30);
    expect(r.porosity).toBeLessThan(50);
    expect(r.gammaDry).toBeGreaterThan(14);
    expect(r.gammaDry).toBeLessThan(17);
    expect(r.gammaSat).toBeGreaterThan(r.gammaDry);
    expect(r.gammaSub).toBeCloseTo(r.gammaSat - 9.81, 1);
    expect(r.phases.Vt).toBeCloseTo(1.7, 1);
  });

  it("from_ratios — fully saturated S=100", () => {
    const r = soilPhaseRelations({ mode: "from_ratios", voidRatio: 0.6, saturation: 100, Gs: 2.65 });
    expect(r.saturation).toBe(100);
    expect(r.phases.Va).toBeCloseTo(0, 1);
    expect(r.gammaNat).toBeCloseTo(r.gammaSat, 1);
  });

  it("from_weights — should back-calculate e and S", () => {
    const r = soilPhaseRelations({ mode: "from_weights", totalWeight: 20, solidWeight: 16, waterWeight: 4, totalVolume: 1, Gs: 2.65 });
    expect(r.voidRatio).toBeGreaterThan(0);
    expect(r.waterContent).toBeCloseTo(25, 0);
    expect(r.saturation).toBeGreaterThan(0);
  });
});

describe("Proctor Analysis", () => {
  const points = [
    { waterContent: 8, dryDensity: 17.2 },
    { waterContent: 10, dryDensity: 18.1 },
    { waterContent: 12, dryDensity: 18.8 },
    { waterContent: 14, dryDensity: 18.5 },
    { waterContent: 16, dryDensity: 17.9 },
  ];

  it("should find optimum water content and max dry density", () => {
    const r = proctorAnalysis({ points, testType: "standard" });
    expect(r.optimumWaterContent).toBeGreaterThan(10);
    expect(r.optimumWaterContent).toBeLessThan(15);
    expect(r.maxDryDensity).toBeGreaterThan(18);
    expect(r.zavCurve.length).toBeGreaterThan(5);
    expect(r.fitCurve.length).toBeGreaterThan(5);
  });

  it("should compute 95% range", () => {
    const r = proctorAnalysis({ points, testType: "modified" });
    expect(r.range95.gammaD95).toBeCloseTo(r.maxDryDensity * 0.95, 1);
    expect(r.range95.wMin).toBeLessThan(r.optimumWaterContent);
    expect(r.range95.wMax).toBeGreaterThan(r.optimumWaterContent);
  });

  it("should handle less than 3 points gracefully", () => {
    const r = proctorAnalysis({ points: [{ waterContent: 10, dryDensity: 18 }], testType: "standard" });
    expect(r.optimumWaterContent).toBe(0);
  });
});
