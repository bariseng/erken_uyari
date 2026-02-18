import { describe, it, expect } from "vitest";
import { elasticSettlement, consolidationSettlement, schmertmannSettlement } from "../src/settlement/index";
import { evaluateLiquefaction } from "../src/liquefaction/index";
import { bishop, janbu, fellenius } from "../src/slope-stability/index";
import { pileCapacityStatic, pileCapacitySPT, lateralPileBroms } from "../src/pile-capacity/index";

// ─── Oturma ───
describe("Settlement", () => {
  it("elastic settlement — should compute reasonable value", () => {
    const r = elasticSettlement({ width: 2, length: 2, pressure: 150, elasticModulus: 20000, poissonRatio: 0.3 });
    expect(r.settlement).toBeGreaterThan(0);
    expect(r.settlement).toBeLessThan(100);
  });

  it("consolidation — NC clay", () => {
    const r = consolidationSettlement({ thickness: 4, e0: 0.9, Cc: 0.3, sigma0: 80, deltaSigma: 50 });
    expect(r.primarySettlement).toBeGreaterThan(0);
    expect(r.soilState).toBe("NC");
  });

  it("consolidation — OC clay case 2", () => {
    const r = consolidationSettlement({ thickness: 4, e0: 0.9, Cc: 0.3, Cs: 0.06, sigma0: 80, deltaSigma: 80, preconsolidationPressure: 120 });
    expect(r.primarySettlement).toBeGreaterThan(0);
    expect(r.soilState).toBe("OC-case2");
  });

  it("consolidation — time settlement with Cv", () => {
    const r = consolidationSettlement({ thickness: 4, e0: 0.9, Cc: 0.3, sigma0: 80, deltaSigma: 50, cv: 2.0, drainage: "double" });
    expect(r.timeSettlement).toBeDefined();
    expect(r.timeSettlement!.timeDays.length).toBeGreaterThan(5);
  });

  it("Schmertmann — should compute with layers", () => {
    const r = schmertmannSettlement({
      width: 2, pressure: 150, depth: 1, gamma: 18,
      layers: [
        { depthTop: 0, depthBottom: 1, Es: 15000 },
        { depthTop: 1, depthBottom: 3, Es: 20000 },
        { depthTop: 3, depthBottom: 5, Es: 25000 },
      ],
    });
    expect(r.settlement).toBeGreaterThan(0);
    expect(r.C1).toBeGreaterThan(0);
    expect(r.layerContributions.length).toBeGreaterThan(0);
  });
});

// ─── Sıvılaşma ───
describe("Liquefaction", () => {
  it("should evaluate SPT-based liquefaction", () => {
    const r = evaluateLiquefaction({
      magnitude: 7.5, amax: 0.4, waterTableDepth: 2, gamma: 18, gammaSat: 20,
      layers: [
        { depth: 3, N: 10, finesContent: 15 },
        { depth: 6, N: 15, finesContent: 10 },
        { depth: 9, N: 25, finesContent: 5 },
        { depth: 12, N: 8, finesContent: 20 },
      ],
    });
    expect(r.layers.length).toBe(4);
    expect(r.LPI).toBeGreaterThanOrEqual(0);
    expect(["low", "moderate", "high", "very_high"]).toContain(r.riskLevel);
    // Shallow loose sand with high amax should liquefy
    expect(r.layers[0].FS).toBeLessThan(2);
  });

  it("dense sand should be safe", () => {
    const r = evaluateLiquefaction({
      magnitude: 6.5, amax: 0.2, waterTableDepth: 3,
      layers: [{ depth: 5, N: 40, finesContent: 5 }],
    });
    expect(r.layers[0].status).toBe("safe");
  });

  it("MSF should decrease with magnitude", () => {
    const r1 = evaluateLiquefaction({ magnitude: 6.0, amax: 0.3, waterTableDepth: 2, layers: [{ depth: 5, N: 15 }] });
    const r2 = evaluateLiquefaction({ magnitude: 8.0, amax: 0.3, waterTableDepth: 2, layers: [{ depth: 5, N: 15 }] });
    expect(r1.layers[0].MSF).toBeGreaterThan(r2.layers[0].MSF);
  });
});

// ─── Şev Stabilitesi ───
describe("Slope Stability", () => {
  const baseInput = { height: 10, slopeAngle: 30, gamma: 18, cohesion: 25, frictionAngle: 25 };

  it("Bishop — should find FS > 0", () => {
    const r = bishop(baseInput);
    expect(r.FS).toBeGreaterThan(0.5);
    expect(r.slices.length).toBeGreaterThan(0);
    expect(r.criticalRadius).toBeGreaterThan(0);
  });

  it("Janbu — should find FS > 0", () => {
    const r = janbu(baseInput);
    expect(r.FS).toBeGreaterThan(0.5);
  });

  it("Fellenius — should find FS > 0", () => {
    const r = fellenius(baseInput);
    expect(r.FS).toBeGreaterThan(0.5);
  });

  it("Seismic should reduce FS", () => {
    const rStatic = bishop(baseInput);
    const rSeismic = bishop({ ...baseInput, kh: 0.15 });
    expect(rSeismic.FS).toBeLessThan(rStatic.FS);
  });

  it("Higher cohesion should increase FS", () => {
    const rLow = bishop({ ...baseInput, cohesion: 10 });
    const rHigh = bishop({ ...baseInput, cohesion: 50 });
    expect(rHigh.FS).toBeGreaterThan(rLow.FS);
  });
});

// ─── Kazık Kapasitesi ───
describe("Pile Capacity", () => {
  const basePile = {
    diameter: 0.6, length: 15, pileType: "driven" as const,
    layers: [
      { depthTop: 0, depthBottom: 5, soilType: "clay" as const, cu: 40, gamma: 17 },
      { depthTop: 5, depthBottom: 10, soilType: "sand" as const, frictionAngle: 32, gamma: 19, N: 20 },
      { depthTop: 10, depthBottom: 20, soilType: "clay" as const, cu: 80, gamma: 18, N: 15 },
    ],
  };

  it("Static method — should compute Qp + Qs", () => {
    const r = pileCapacityStatic(basePile);
    expect(r.tipCapacity).toBeGreaterThan(0);
    expect(r.shaftCapacity).toBeGreaterThan(0);
    expect(r.ultimate).toBe(r.tipCapacity + r.shaftCapacity);
    expect(r.allowable).toBeCloseTo(r.ultimate / 2.5, 0);
  });

  it("SPT method — should compute", () => {
    const r = pileCapacitySPT(basePile);
    expect(r.ultimate).toBeGreaterThan(0);
    expect(r.layerDetails.length).toBe(3);
  });

  it("Bored pile should have lower capacity than driven", () => {
    const rDriven = pileCapacityStatic(basePile);
    const rBored = pileCapacityStatic({ ...basePile, pileType: "bored" });
    expect(rBored.ultimate).toBeLessThan(rDriven.ultimate);
  });

  it("Broms lateral — clay", () => {
    const r = lateralPileBroms({
      diameter: 0.6, length: 15, EI: 50000, soilType: "clay", cu: 50, gamma: 18, headCondition: "free",
    });
    expect(r.ultimateLoad).toBeGreaterThan(0);
    expect(r.allowableLoad).toBeGreaterThan(0);
  });

  it("Broms lateral — fixed head should be stronger", () => {
    const rFree = lateralPileBroms({ diameter: 0.6, length: 15, EI: 50000, soilType: "sand", frictionAngle: 30, gamma: 18, headCondition: "free" });
    const rFixed = lateralPileBroms({ diameter: 0.6, length: 15, EI: 50000, soilType: "sand", frictionAngle: 30, gamma: 18, headCondition: "fixed" });
    expect(rFixed.ultimateLoad).toBeGreaterThan(rFree.ultimateLoad);
  });
});
