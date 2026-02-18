import { describe, it, expect } from "vitest";
import { stressProfile, sptCorrelations, darcySeepage } from "../src/field-tests/index";

describe("Stress Profile", () => {
  it("should compute effective stress with water table", () => {
    const r = stressProfile({
      layers: [
        { thickness: 3, gamma: 17 },
        { thickness: 7, gamma: 18, gammaSat: 20 },
      ],
      waterTableDepth: 3,
    });
    expect(r.profile.length).toBeGreaterThan(5);
    const last = r.profile[r.profile.length - 1];
    expect(last.totalStress).toBeGreaterThan(0);
    expect(last.porePressure).toBeGreaterThan(0);
    expect(last.effectiveStress).toBeLessThan(last.totalStress);
    expect(last.effectiveStress).toBeCloseTo(last.totalStress - last.porePressure, 1);
  });

  it("no water table — pore pressure should be 0", () => {
    const r = stressProfile({
      layers: [{ thickness: 10, gamma: 18 }],
      waterTableDepth: 20,
    });
    const last = r.profile[r.profile.length - 1];
    expect(last.porePressure).toBe(0);
    expect(last.effectiveStress).toBeCloseTo(last.totalStress, 1);
  });

  it("surcharge should add to total stress", () => {
    const noQ = stressProfile({ layers: [{ thickness: 5, gamma: 18 }], waterTableDepth: 10 });
    const withQ = stressProfile({ layers: [{ thickness: 5, gamma: 18 }], waterTableDepth: 10, surcharge: 50 });
    const lastNoQ = noQ.profile[noQ.profile.length - 1];
    const lastQ = withQ.profile[withQ.profile.length - 1];
    expect(lastQ.totalStress - lastNoQ.totalStress).toBeCloseTo(50, 0);
  });
});

describe("SPT Correlations", () => {
  it("sand — should compute Dr and phi", () => {
    const r = sptCorrelations({ N: 20, depth: 8, effectiveStress: 100, soilType: "sand" });
    expect(r.N60).toBeGreaterThan(0);
    expect(r.N1_60).toBeGreaterThan(0);
    expect(r.relativeDensity).toBeGreaterThan(0);
    expect(r.frictionAngle).toBeGreaterThan(25);
    expect(r.density).toBeDefined();
  });

  it("clay — should compute cu and consistency", () => {
    const r = sptCorrelations({ N: 10, depth: 5, effectiveStress: 60, soilType: "clay" });
    expect(r.cu).toBeGreaterThan(0);
    expect(r.consistency).toBeDefined();
    expect(r.elasticModulus).toBeGreaterThan(0);
  });

  it("CN should not exceed 1.7", () => {
    const r = sptCorrelations({ N: 15, depth: 1, effectiveStress: 10, soilType: "sand" });
    expect(r.CN).toBeLessThanOrEqual(1.7);
  });

  it("deeper rod should have higher CR", () => {
    const shallow = sptCorrelations({ N: 20, depth: 2, effectiveStress: 30, soilType: "sand" });
    const deep = sptCorrelations({ N: 20, depth: 15, effectiveStress: 150, soilType: "sand" });
    // shallow has CR=0.75, deep has CR=1.0, so N60 differs
    expect(deep.N60).toBeGreaterThan(shallow.N60);
  });
});

describe("Darcy Seepage", () => {
  it("should compute flow rate", () => {
    const r = darcySeepage({ permeability: 1e-4, hydraulicGradient: 0.5, area: 10 });
    expect(r.flowRate).toBeGreaterThan(0);
    expect(r.darcyVelocity).toBeCloseTo(1e-4 * 0.5, 5);
    expect(r.flowRateLpm).toBeGreaterThan(0);
  });

  it("should compute critical gradient and FS", () => {
    const r = darcySeepage({ permeability: 1e-4, hydraulicGradient: 0.5, area: 10, Gs: 2.65, voidRatio: 0.7 });
    expect(r.criticalGradient).toBeCloseTo((2.65 - 1) / 1.7, 1);
    expect(r.FS_heave).toBeGreaterThan(1);
  });

  it("high gradient should lower FS", () => {
    const safe = darcySeepage({ permeability: 1e-4, hydraulicGradient: 0.3, area: 1 });
    const risky = darcySeepage({ permeability: 1e-4, hydraulicGradient: 0.9, area: 1 });
    expect(risky.FS_heave!).toBeLessThan(safe.FS_heave!);
  });
});
