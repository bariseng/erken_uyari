import { describe, it, expect } from "vitest";
import { classifyUSCS } from "../src/classification/uscs.js";
import { classifyAASHTO } from "../src/classification/aashto.js";
import { classifyTBDY2018 } from "../src/classification/tbdy2018.js";
import { terzaghi, meyerhof, hansen, vesic } from "../src/bearing-capacity/index.js";
import { rankine, coulomb, mononobeOkabe } from "../src/lateral-pressure/index.js";
import { calculateSeismicParams } from "../src/seismic/index.js";

// ─── USCS ───
describe("USCS Classification", () => {
  it("should classify well-graded gravel (GW)", () => {
    const result = classifyUSCS({
      grainSize: { fines: 3, passing4: 40, d10: 0.5, d30: 5, d60: 25 },
    });
    expect(result.symbol).toBe("GW");
  });

  it("should classify poorly-graded sand (SP)", () => {
    const result = classifyUSCS({
      grainSize: { fines: 2, passing4: 95, d10: 0.2, d30: 0.25, d60: 0.3 },
    });
    expect(result.symbol).toBe("SP");
  });

  it("should classify lean clay (CL)", () => {
    const result = classifyUSCS({
      grainSize: { fines: 70, passing4: 90 },
      atterberg: { liquidLimit: 35, plasticLimit: 18 },
    });
    expect(result.symbol).toBe("CL");
  });

  it("should classify fat clay (CH)", () => {
    const result = classifyUSCS({
      grainSize: { fines: 85, passing4: 95 },
      atterberg: { liquidLimit: 65, plasticLimit: 25 },
    });
    expect(result.symbol).toBe("CH");
  });

  it("should classify silt (ML)", () => {
    const result = classifyUSCS({
      grainSize: { fines: 60, passing4: 90 },
      atterberg: { liquidLimit: 30, plasticLimit: 27 },
    });
    expect(result.symbol).toBe("ML");
  });

  it("should classify silty sand (SM)", () => {
    const result = classifyUSCS({
      grainSize: { fines: 20, passing4: 85 },
      atterberg: { liquidLimit: 25, plasticLimit: 22 },
    });
    expect(result.symbol).toBe("SM");
  });

  it("should classify clayey gravel (GC)", () => {
    const result = classifyUSCS({
      grainSize: { fines: 18, passing4: 40 },
      atterberg: { liquidLimit: 40, plasticLimit: 18 },
    });
    expect(result.symbol).toBe("GC");
  });
});

// ─── AASHTO ───
describe("AASHTO Classification", () => {
  it("should classify A-1-a", () => {
    const result = classifyAASHTO({
      fines: 10, passing40: 25, passing10: 45,
    });
    expect(result.group).toBe("A-1-a");
    expect(result.groupIndex).toBe(0);
  });

  it("should classify A-7-6 (high plasticity clay)", () => {
    const result = classifyAASHTO({
      fines: 80, passing40: 90, passing10: 95,
      liquidLimit: 55, plasticityIndex: 30,
    });
    expect(result.group).toBe("A-7-6");
    expect(result.rating).toBe("Poor");
  });

  it("should classify A-4 (silty soil)", () => {
    const result = classifyAASHTO({
      fines: 60, passing40: 75, passing10: 85,
      liquidLimit: 30, plasticityIndex: 5,
    });
    expect(result.group).toBe("A-4");
  });
});

// ─── TBDY 2018 Zemin Sınıfı ───
describe("TBDY 2018 Soil Classification", () => {
  it("should classify ZA for Vs30 > 1500", () => {
    const result = classifyTBDY2018({ vs30: 1800 });
    expect(result.soilClass).toBe("ZA");
  });

  it("should classify ZC for Vs30 = 500", () => {
    const result = classifyTBDY2018({ vs30: 500 });
    expect(result.soilClass).toBe("ZC");
  });

  it("should classify ZD for N60 = 25", () => {
    const result = classifyTBDY2018({ n60: 25 });
    expect(result.soilClass).toBe("ZD");
  });

  it("should classify ZE for cu = 50", () => {
    const result = classifyTBDY2018({ cu: 50 });
    expect(result.soilClass).toBe("ZE");
  });
});

// ─── Taşıma Kapasitesi ───
describe("Bearing Capacity", () => {
  const baseInput = {
    width: 2, length: 2, depth: 1.5,
    gamma: 18, cohesion: 20, frictionAngle: 30,
  };

  it("Terzaghi — should compute reasonable qu", () => {
    const r = terzaghi(baseInput);
    expect(r.ultimate).toBeGreaterThan(500);
    expect(r.allowable).toBeGreaterThan(100);
    expect(r.factors.Nc).toBeGreaterThan(30);
    expect(r.safetyFactor).toBe(3);
  });

  it("Meyerhof — should include shape and depth factors", () => {
    const r = meyerhof(baseInput);
    expect(r.shapeFactors).toBeDefined();
    expect(r.depthFactors).toBeDefined();
    expect(r.ultimate).toBeGreaterThan(500);
  });

  it("Hansen — should compute Ngamma with 1.5(Nq-1)tan(phi)", () => {
    const r = hansen(baseInput);
    expect(r.factors.Ngamma).toBeGreaterThan(10);
    expect(r.ultimate).toBeGreaterThan(400);
  });

  it("Vesic — should compute Ngamma with 2(Nq+1)tan(phi)", () => {
    const r = vesic(baseInput);
    expect(r.factors.Ngamma).toBeGreaterThan(r.factors.Nq);
    expect(r.ultimate).toBeGreaterThan(400);
  });

  it("Pure clay (phi=0) — should work", () => {
    const r = terzaghi({ ...baseInput, frictionAngle: 0, cohesion: 50 });
    expect(r.factors.Nc).toBeCloseTo(5.7, 0);
    expect(r.factors.Nq).toBeCloseTo(1.0, 0);
    expect(r.ultimate).toBeGreaterThan(200);
  });
});

// ─── Yanal Toprak Basıncı ───
describe("Lateral Earth Pressure", () => {
  const baseInput = {
    wallHeight: 6, gamma: 18, cohesion: 0, frictionAngle: 30,
  };

  it("Rankine — Ka should be ~0.333 for phi=30", () => {
    const r = rankine(baseInput);
    expect(r.Ka).toBeCloseTo(0.333, 2);
    expect(r.Kp).toBeCloseTo(3.0, 1);
    expect(r.activeForcePa).toBeGreaterThan(0);
  });

  it("Coulomb — should account for wall friction", () => {
    const r = coulomb({ ...baseInput, wallFriction: 20 });
    expect(r.Ka).toBeLessThan(0.333); // wall friction reduces Ka
    expect(r.activeForcePa).toBeGreaterThan(0);
  });

  it("Mononobe-Okabe — seismic should increase Ka", () => {
    const rStatic = coulomb(baseInput);
    const rSeismic = mononobeOkabe({ ...baseInput, kh: 0.2, kv: 0 });
    expect(rSeismic.Ka).toBeGreaterThan(rStatic.Ka);
  });

  it("Rankine — with surcharge", () => {
    const r = rankine({ ...baseInput, surcharge: 20 });
    const rNoSurcharge = rankine(baseInput);
    expect(r.activeForcePa).toBeGreaterThan(rNoSurcharge.activeForcePa);
  });
});

// ─── TBDY 2018 Deprem Parametreleri ───
describe("TBDY 2018 Seismic Parameters", () => {
  it("should compute SDS and SD1 for Istanbul ZC", () => {
    const r = calculateSeismicParams({
      Ss: 1.2, S1: 0.3, soilClass: "ZC",
    });
    expect(r.SDS).toBeGreaterThan(1.0);
    expect(r.SD1).toBeGreaterThan(0.3);
    expect(r.TA).toBeGreaterThan(0);
    expect(r.TB).toBeGreaterThan(r.TA);
    expect(r.spectrum.periods.length).toBeGreaterThan(10);
  });

  it("should compute higher values for ZE vs ZB", () => {
    const rZB = calculateSeismicParams({ Ss: 0.5, S1: 0.2, soilClass: "ZB" });
    const rZE = calculateSeismicParams({ Ss: 0.5, S1: 0.2, soilClass: "ZE" });
    expect(rZE.SDS).toBeGreaterThan(rZB.SDS);
    expect(rZE.SD1).toBeGreaterThan(rZB.SD1);
  });

  it("should generate valid spectrum", () => {
    const r = calculateSeismicParams({ Ss: 1.0, S1: 0.25, soilClass: "ZD" });
    expect(r.spectrum.periods[0]).toBe(0);
    expect(r.spectrum.elasticSa.length).toBe(r.spectrum.periods.length);
    // Spectrum should peak at plateau
    const maxSa = Math.max(...r.spectrum.elasticSa);
    expect(maxSa).toBeCloseTo(r.SDS, 1);
  });

  it("DTS should be 4 for high SDS", () => {
    const r = calculateSeismicParams({ Ss: 1.5, S1: 0.4, soilClass: "ZD" });
    expect(r.DTS).toBe(4);
  });
});
