import { describe, it, expect } from "vitest";
import { mohrCircle, shallowFoundationDesign } from "../src/stress-foundation/index";

describe("Mohr Circle", () => {
  it("should compute center and radius", () => {
    const r = mohrCircle({ sigma1: 200, sigma3: 50 });
    expect(r.center).toBe(125);
    expect(r.radius).toBe(75);
    expect(r.tauMax).toBe(75);
    expect(r.q).toBe(150);
    expect(r.circlePoints.length).toBeGreaterThan(30);
  });

  it("should compute failure plane with Mohr-Coulomb", () => {
    const r = mohrCircle({ sigma1: 300, sigma3: 100, cohesion: 20, frictionAngle: 30 });
    expect(r.failurePlaneAngle).toBe(60);
    expect(r.sigmaF).toBeDefined();
    expect(r.tauF).toBeDefined();
    expect(r.FS).toBeGreaterThan(0);
  });

  it("equal stresses should give zero radius", () => {
    const r = mohrCircle({ sigma1: 100, sigma3: 100 });
    expect(r.radius).toBe(0);
    expect(r.tauMax).toBe(0);
  });
});

describe("Shallow Foundation Design", () => {
  it("square — should size foundation", () => {
    const r = shallowFoundationDesign({ load: 500, depth: 1.5, allowableBearing: 150, gamma: 18, type: "square" });
    expect(r.B).toBeGreaterThan(1);
    expect(r.B).toBe(r.L);
    expect(r.requiredArea).toBeGreaterThan(0);
    expect(r.netPressure).toBeLessThanOrEqual(150);
  });

  it("rectangular with moment — should check kern", () => {
    const r = shallowFoundationDesign({ load: 800, momentX: 50, depth: 1.5, allowableBearing: 200, gamma: 18, type: "rectangular", aspectRatio: 1.5 });
    expect(r.ex).toBeGreaterThan(0);
    expect(r.pressureDistribution.qMax).toBeGreaterThan(r.pressureDistribution.qAvg);
  });

  it("large moment should exceed kern", () => {
    const r = shallowFoundationDesign({ load: 300, momentX: 200, depth: 1, allowableBearing: 150, gamma: 18, type: "square" });
    expect(r.ex).toBeGreaterThan(0);
    // ex = 200/300 = 0.667m, B ≈ 1.6m, B/6 ≈ 0.27 → kern dışı
    expect(r.withinKern).toBe(false);
  });

  it("circular foundation", () => {
    const r = shallowFoundationDesign({ load: 400, depth: 1, allowableBearing: 200, gamma: 18, type: "circular" });
    expect(r.B).toBeGreaterThan(0);
    expect(r.B).toBe(r.L);
  });
});
