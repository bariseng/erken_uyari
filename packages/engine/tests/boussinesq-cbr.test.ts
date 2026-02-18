import { describe, it, expect } from "vitest";
import { boussinesqPoint, boussinesqRect, boussinesqProfile, cbrCorrelations } from "../src/boussinesq-cbr/index";

describe("Boussinesq Point Load", () => {
  it("should compute stress at depth", () => {
    const r = boussinesqPoint({ load: 100, depth: 2, radialDistance: 0 });
    expect(r.deltaStress).toBeGreaterThan(0);
    expect(r.influenceFactor).toBeGreaterThan(0);
  });

  it("stress should decrease with depth", () => {
    const shallow = boussinesqPoint({ load: 100, depth: 1, radialDistance: 0 });
    const deep = boussinesqPoint({ load: 100, depth: 5, radialDistance: 0 });
    expect(deep.deltaStress).toBeLessThan(shallow.deltaStress);
  });

  it("stress should decrease with radial distance", () => {
    const center = boussinesqPoint({ load: 100, depth: 2, radialDistance: 0 });
    const offset = boussinesqPoint({ load: 100, depth: 2, radialDistance: 3 });
    expect(offset.deltaStress).toBeLessThan(center.deltaStress);
  });
});

describe("Boussinesq Rectangular", () => {
  it("should compute stress under center", () => {
    const r = boussinesqRect({ pressure: 100, B: 2, L: 3, depth: 2 });
    expect(r.deltaStress).toBeGreaterThan(0);
    expect(r.deltaStress).toBeLessThan(100);
  });

  it("profile should decrease with depth", () => {
    const p = boussinesqProfile({ pressure: 100, B: 2, L: 2 });
    expect(p.length).toBeGreaterThan(10);
    expect(p[0].deltaStress).toBeCloseTo(100, 0);
    expect(p[p.length - 1].deltaStress).toBeLessThan(p[0].deltaStress);
  });
});

describe("CBR Correlations", () => {
  it("should compute Mr and k", () => {
    const r = cbrCorrelations({ cbr: 10 });
    expect(r.resilientModulus).toBeCloseTo(103, 0);
    expect(r.subgradeModulus).toBeGreaterThan(0);
    expect(r.approxBearing).toBe(100);
  });

  it("low CBR should be poor quality", () => {
    const r = cbrCorrelations({ cbr: 2 });
    expect(r.soilQuality).toContain("zayıf");
  });

  it("high CBR should need thinner pavement", () => {
    const low = cbrCorrelations({ cbr: 5 });
    const high = cbrCorrelations({ cbr: 30 });
    expect(high.pavementThickness).toBeLessThan(low.pavementThickness);
  });
});
