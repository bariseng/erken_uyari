import { describe, it, expect } from "vitest";
import { gravityWallStability, reinforcedSoilDesign } from "../src/retaining-stability/index";

describe("Gravity Wall Stability", () => {
  it("should compute all safety factors", () => {
    const r = gravityWallStability({ height: 4, baseWidth: 2.5, topWidth: 0.5, gammaWall: 24, gammaFill: 18, frictionAngle: 30, bearingCapacity: 200 });
    expect(r.FS_overturn).toBeGreaterThan(0);
    expect(r.FS_sliding).toBeGreaterThan(0);
    expect(r.wallWeight).toBeGreaterThan(0);
    expect(r.Pa).toBeGreaterThan(0);
    expect(r.details.length).toBe(4);
  });

  it("wide base should be more stable", () => {
    const narrow = gravityWallStability({ height: 4, baseWidth: 1.5, topWidth: 0.5, gammaWall: 24, gammaFill: 18, frictionAngle: 30, bearingCapacity: 200 });
    const wide = gravityWallStability({ height: 4, baseWidth: 3, topWidth: 0.5, gammaWall: 24, gammaFill: 18, frictionAngle: 30, bearingCapacity: 200 });
    expect(wide.FS_overturn).toBeGreaterThan(narrow.FS_overturn);
    expect(wide.FS_sliding).toBeGreaterThan(narrow.FS_sliding);
  });

  it("seismic should reduce FS", () => {
    const stat = gravityWallStability({ height: 4, baseWidth: 2.5, topWidth: 0.5, gammaWall: 24, gammaFill: 18, frictionAngle: 30, bearingCapacity: 200 });
    const seis = gravityWallStability({ height: 4, baseWidth: 2.5, topWidth: 0.5, gammaWall: 24, gammaFill: 18, frictionAngle: 30, bearingCapacity: 200, kh: 0.15 });
    expect(seis.FS_sliding).toBeLessThan(stat.FS_sliding);
  });
});

describe("Reinforced Soil Design", () => {
  it("should compute layers and FS", () => {
    const r = reinforcedSoilDesign({ height: 6, gamma: 18, frictionAngle: 32, geogridStrength: 50, verticalSpacing: 0.5 });
    expect(r.numberOfLayers).toBe(12);
    expect(r.layers.length).toBe(12);
    expect(r.FS_internal).toBeGreaterThan(0);
    expect(r.FS_external).toBeGreaterThan(0);
    expect(r.allowableStrength).toBeGreaterThan(0);
  });

  it("stronger geogrid should increase FS_internal", () => {
    const weak = reinforcedSoilDesign({ height: 6, gamma: 18, frictionAngle: 32, geogridStrength: 30, verticalSpacing: 0.5 });
    const strong = reinforcedSoilDesign({ height: 6, gamma: 18, frictionAngle: 32, geogridStrength: 80, verticalSpacing: 0.5 });
    expect(strong.FS_internal).toBeGreaterThan(weak.FS_internal);
  });
});
