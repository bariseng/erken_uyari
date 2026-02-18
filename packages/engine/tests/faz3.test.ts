import { describe, it, expect } from "vitest";
import { analyzeRetainingWall } from "../src/retaining-wall/index";
import { calculateVs30, siteResponseAnalysis } from "../src/site-response/index";

// ─── İksa ───
describe("Retaining Wall", () => {
  it("cantilever — should find embedment depth", () => {
    const r = analyzeRetainingWall({ excavationDepth: 5, gamma: 18, cohesion: 0, frictionAngle: 30, condition: "cantilever" });
    expect(r.embedmentDepth).toBeGreaterThan(0);
    expect(r.totalLength).toBeGreaterThan(5);
    expect(r.maxMoment).toBeGreaterThan(0);
    expect(r.Ka).toBeCloseTo(0.333, 2);
  });

  it("single anchor — should compute anchor force", () => {
    const r = analyzeRetainingWall({ excavationDepth: 8, gamma: 18, cohesion: 5, frictionAngle: 28, condition: "single_anchor", supportLevels: [2] });
    expect(r.anchorForces.length).toBe(1);
    expect(r.anchorForces[0]).toBeGreaterThan(0);
    expect(r.embedmentDepth).toBeGreaterThan(0);
  });

  it("multi anchor — should compute multiple anchor forces", () => {
    const r = analyzeRetainingWall({ excavationDepth: 12, gamma: 18, cohesion: 0, frictionAngle: 32, condition: "multi_anchor", supportLevels: [2, 5, 8] });
    expect(r.anchorForces.length).toBe(3);
    r.anchorForces.forEach(f => expect(f).toBeGreaterThan(0));
  });

  it("seismic should increase embedment", () => {
    const rStatic = analyzeRetainingWall({ excavationDepth: 6, gamma: 18, cohesion: 0, frictionAngle: 30, condition: "cantilever" });
    const rSeismic = analyzeRetainingWall({ excavationDepth: 6, gamma: 18, cohesion: 0, frictionAngle: 30, condition: "cantilever", kh: 0.15 });
    expect(rSeismic.embedmentDepth).toBeGreaterThanOrEqual(rStatic.embedmentDepth);
  });

  it("pressure diagram should have entries", () => {
    const r = analyzeRetainingWall({ excavationDepth: 6, gamma: 18, cohesion: 10, frictionAngle: 25, condition: "cantilever" });
    expect(r.pressureDiagram.length).toBeGreaterThan(10);
  });
});

// ─── Saha Tepki ───
describe("Site Response", () => {
  const baseLayers = [
    { thickness: 5, vs: 150, gamma: 17 },
    { thickness: 10, vs: 250, gamma: 18 },
    { thickness: 15, vs: 400, gamma: 19 },
  ];

  it("Vs30 — should compute correctly", () => {
    const r = calculateVs30(baseLayers);
    expect(r.vs30).toBeGreaterThan(100);
    expect(r.vs30).toBeLessThan(500);
    expect(r.totalThickness).toBe(30);
    expect(r.layers.length).toBe(3);
    expect(["ZA", "ZB", "ZC", "ZD", "ZE"]).toContain(r.soilClass);
  });

  it("Vs30 — soft soil should be ZD or ZE", () => {
    const r = calculateVs30([{ thickness: 30, vs: 150 }]);
    expect(r.vs30).toBeCloseTo(150, 0);
    expect(r.soilClass).toBe("ZE");
  });

  it("Vs30 — rock should be ZB", () => {
    const r = calculateVs30([{ thickness: 30, vs: 800 }]);
    expect(r.soilClass).toBe("ZB");
  });

  it("site response — should amplify PGA", () => {
    const r = siteResponseAnalysis({ layers: baseLayers, rockPGA: 0.3 });
    expect(r.surfacePGA).toBeGreaterThan(0);
    expect(r.amplificationFactor).toBeGreaterThan(0.5);
    expect(r.naturalPeriod).toBeGreaterThan(0);
    expect(r.transferFunction.length).toBeGreaterThan(10);
  });

  it("soft soil should amplify more than stiff", () => {
    const soft = siteResponseAnalysis({ layers: [{ thickness: 30, vs: 120, gamma: 16 }], rockPGA: 0.2 });
    const stiff = siteResponseAnalysis({ layers: [{ thickness: 30, vs: 500, gamma: 20 }], rockPGA: 0.2 });
    expect(soft.amplificationFactor).toBeGreaterThan(stiff.amplificationFactor);
  });
});
