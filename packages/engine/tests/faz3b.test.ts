import { describe, it, expect } from "vitest";
import { consolidationTime, pvdAnalysis } from "../src/consolidation/index";
import { dynamicCompaction, stoneColumn, preloading } from "../src/soil-improvement/index";

// ─── Konsolidasyon ───
describe("Consolidation Time", () => {
  it("should compute time for target degree", () => {
    const r = consolidationTime({ cv: 3, drainagePath: 5, targetDegree: 90 });
    expect(r.requiredTime).toBeGreaterThan(0);
    expect(r.Tv).toBeGreaterThan(0);
    expect(r.timeCurve.length).toBeGreaterThan(10);
  });

  it("should compute degree for target time", () => {
    const r = consolidationTime({ cv: 3, drainagePath: 5, targetTime: 2 });
    expect(r.degreeOfConsolidation).toBeGreaterThan(0);
    expect(r.degreeOfConsolidation!).toBeLessThan(100);
  });

  it("should compute settlement when totalSettlement given", () => {
    const r = consolidationTime({ cv: 3, drainagePath: 5, targetTime: 2, totalSettlement: 0.5 });
    expect(r.currentSettlement).toBeGreaterThan(0);
    expect(r.currentSettlement!).toBeLessThanOrEqual(0.5);
  });

  it("higher Cv should consolidate faster", () => {
    const slow = consolidationTime({ cv: 1, drainagePath: 5, targetDegree: 90 });
    const fast = consolidationTime({ cv: 5, drainagePath: 5, targetDegree: 90 });
    expect(fast.requiredTime!).toBeLessThan(slow.requiredTime!);
  });
});

describe("PVD Analysis", () => {
  it("should speed up consolidation", () => {
    const r = pvdAnalysis({ cv: 2, ch: 6, layerThickness: 10, spacing: 1.5, pattern: "triangular", drainDiameter: 0.05, targetDegree: 90 });
    expect(r.timeWithPVD).toBeLessThan(r.timeWithoutPVD);
    expect(r.speedupFactor).toBeGreaterThan(1);
    expect(r.comparison.length).toBeGreaterThan(10);
  });

  it("triangular should have smaller De than square", () => {
    const tri = pvdAnalysis({ cv: 2, ch: 6, layerThickness: 10, spacing: 1.5, pattern: "triangular", drainDiameter: 0.05, targetDegree: 90 });
    const sq = pvdAnalysis({ cv: 2, ch: 6, layerThickness: 10, spacing: 1.5, pattern: "square", drainDiameter: 0.05, targetDegree: 90 });
    expect(tri.influenceDiameter).toBeLessThan(sq.influenceDiameter);
  });
});

// ─── Zemin İyileştirme ───
describe("Dynamic Compaction", () => {
  it("should compute effective depth (Menard)", () => {
    const r = dynamicCompaction({ weight: 15, dropHeight: 20, soilType: "granular" });
    expect(r.effectiveDepth).toBeGreaterThan(5);
    expect(r.energy).toBe(300);
    expect(r.nCoefficient).toBe(0.5);
  });

  it("cohesive soil should have smaller n", () => {
    const gran = dynamicCompaction({ weight: 15, dropHeight: 20, soilType: "granular" });
    const coh = dynamicCompaction({ weight: 15, dropHeight: 20, soilType: "cohesive" });
    expect(coh.effectiveDepth).toBeLessThan(gran.effectiveDepth);
  });
});

describe("Stone Column", () => {
  it("should compute area ratio and settlement reduction", () => {
    const r = stoneColumn({ diameter: 0.8, spacing: 2, pattern: "triangular", columnFrictionAngle: 40, soilCu: 25, soilGamma: 17, appliedStress: 100, length: 10 });
    expect(r.areaRatio).toBeGreaterThan(0);
    expect(r.areaRatio).toBeLessThan(1);
    expect(r.settlementReductionFactor).toBeGreaterThan(0);
    expect(r.settlementReductionFactor).toBeLessThan(1);
    expect(r.groupCapacity).toBeGreaterThan(0);
  });
});

describe("Preloading", () => {
  it("should compute required preload and fill height", () => {
    const r = preloading({ targetSettlement: 0.3, cv: 2, drainagePath: 5, effectiveStress: 100, Cc: 0.3, layerThickness: 10, e0: 0.8, targetTime: 1 });
    expect(r.requiredPreload).toBeGreaterThan(0);
    expect(r.fillHeight).toBeGreaterThan(0);
    expect(r.degreeAtTargetTime).toBeGreaterThan(0);
    expect(r.time90).toBeGreaterThan(0);
  });
});
