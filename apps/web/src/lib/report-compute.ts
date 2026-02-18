/**
 * GeoForce — Rapor Hesap Köprüsü
 * Modül key + inputs → engine hesaplama → results
 * + Chart data üretimi
 */
import {
  terzaghi, meyerhof, hansen, vesic,
  elasticSettlement, consolidationSettlement, schmertmannSettlement,
  rankine, coulomb, mononobeOkabe,
  calculateSeismicParams,
  bishop, janbu, fellenius,
  analyzeRetainingWall,
  stressProfile,
  sptCorrelations,
  evaluateLiquefaction,
  consolidationTime,
  pvdAnalysis,
  grainSizeAnalysis,
  proctorAnalysis,
  mohrCircle,
  pileCapacityStatic, pileCapacitySPT,
} from "@geoforce/engine";
import type { ModuleKey } from "./report-store";
import type { ChartData } from "./report-charts";

type Inputs = Record<string, any>;

export function computeModule(moduleKey: ModuleKey, method: string, inputs: Inputs): Record<string, any> {
  try {
    switch (moduleKey) {
      case "tasima-kapasitesi":
        return computeBearing(method, inputs);
      case "oturma":
        return computeSettlement(method, inputs);
      case "yanal-basinc":
        return computeLateral(method, inputs);
      case "deprem":
        return computeSeismic(inputs);
      case "sev-stabilitesi":
        return computeSlope(method, inputs);
      case "iksa":
        return computeRetaining(inputs);
      default:
        return computeGeneric(moduleKey, method, inputs);
    }
  } catch (e: any) {
    return { _error: e.message || "Hesaplama hatası" };
  }
}

/**
 * Hesaplama + chart data birlikte döndüren wrapper.
 * Eski computeModule geriye uyumlu kalır.
 */
export function computeModuleWithCharts(
  moduleKey: ModuleKey,
  method: string,
  inputs: Inputs,
): { results: Record<string, any>; charts: ChartData[] } {
  const results = computeModule(moduleKey, method, inputs);
  if (results._error) return { results, charts: [] };

  const charts: ChartData[] = [];

  // Birden fazla chart üretebilen modüller
  if (moduleKey === "konsolidasyon") {
    const c1 = buildConsolidationChart(method, inputs);
    if (c1) charts.push(c1);
  } else if (moduleKey === "arazi-deneyleri") {
    // Efektif gerilme + SPT ayrı chart'lar üretebilir
    const stress = buildFieldTestChart("Efektif", inputs);
    const spt = buildFieldTestChart("SPT", inputs);
    if (method.includes("Efektif") && stress) charts.push(stress);
    if (method.includes("SPT") && spt) charts.push(spt);
    if (!method.includes("Efektif") && !method.includes("SPT")) {
      if (stress) charts.push(stress);
    }
  } else {
    // Tek chart üreten modüller
    const chart = computeChartData(moduleKey, method, inputs);
    if (chart) charts.push(chart);
  }

  return { results, charts };
}

function computeBearing(method: string, i: Inputs) {
  const base = {
    width: n(i, "width", 2),
    length: n(i, "length", 2),
    depth: n(i, "depth", 1.5),
    gamma: n(i, "gamma", 18),
    cohesion: n(i, "cohesion", 20),
    frictionAngle: n(i, "frictionAngle", 30),
    safetyFactor: n(i, "safetyFactor", 3),
  };
  if (method.startsWith("Tümü")) {
    const all = [terzaghi(base), meyerhof(base), hansen(base), vesic(base)];
    return { _multi: true, results: all.map(r => flatten(r)) };
  }
  const fn = method.includes("Meyerhof") ? meyerhof : method.includes("Hansen") ? hansen : method.includes("Vesic") ? vesic : terzaghi;
  return flatten(fn(base));
}

function computeSettlement(method: string, i: Inputs) {
  if (method.includes("Elastik")) {
    return flatten(elasticSettlement({
      width: n(i, "width", 2), length: n(i, "length", 2),
      pressure: n(i, "pressure", 100), elasticModulus: n(i, "elasticModulus", 15000),
      poissonRatio: n(i, "poissonRatio", 0.3),
    }));
  }
  if (method.includes("Konsolidasyon")) {
    return flatten(consolidationSettlement({
      thickness: n(i, "thickness", 4), e0: n(i, "e0", 0.8),
      Cc: n(i, "Cc", 0.25), Cs: n(i, "Cs", 0.05),
      sigma0: n(i, "sigma0", 80), deltaSigma: n(i, "deltaSigma", 50),
      preconsolidationPressure: n(i, "preconsolidationPressure", 100),
    }));
  }
  return flatten(schmertmannSettlement({
    width: n(i, "width", 2), length: n(i, "length", 2),
    depth: n(i, "depth", 1), pressure: n(i, "pressure", 100),
    gamma: n(i, "gamma", 18),
    layers: [{ depthTop: 0, depthBottom: n(i, "layerThickness", 4), Es: n(i, "Es", 10000) }],
  }));
}

function computeLateral(method: string, i: Inputs) {
  const base = {
    wallHeight: n(i, "wallHeight", 5), gamma: n(i, "gamma", 18),
    cohesion: n(i, "cohesion", 0), frictionAngle: n(i, "frictionAngle", 30),
    surcharge: n(i, "surcharge", 10),
  };
  if (method.includes("Coulomb")) return flatten(coulomb({ ...base, wallFriction: n(i, "wallFriction", 20) }));
  if (method.includes("Mononobe")) return flatten(mononobeOkabe({ ...base, kh: n(i, "kh", 0.2), kv: n(i, "kv", 0.1) }));
  return flatten(rankine(base));
}

function computeSeismic(i: Inputs) {
  return flatten(calculateSeismicParams({
    Ss: n(i, "Ss", 1.0), S1: n(i, "S1", 0.3),
    soilClass: (i.soilClass as any) || "ZC",
  }));
}

function computeSlope(method: string, i: Inputs) {
  const base = {
    height: n(i, "height", 10), slopeAngle: n(i, "slopeAngle", 30),
    gamma: n(i, "gamma", 18), cohesion: n(i, "cohesion", 15),
    frictionAngle: n(i, "frictionAngle", 25), ru: n(i, "ru", 0),
  };
  const fn = method.includes("Janbu") ? janbu : method.includes("Fellenius") ? fellenius : bishop;
  return flatten(fn(base));
}

function computeRetaining(i: Inputs) {
  return flatten(analyzeRetainingWall({
    excavationDepth: n(i, "excavationDepth", 6), gamma: n(i, "gamma", 18),
    cohesion: n(i, "cohesion", 5), frictionAngle: n(i, "frictionAngle", 28),
    condition: (i.condition as any) || "cantilever",
  }));
}

function computeGeneric(_key: ModuleKey, _method: string, inputs: Inputs) {
  return { ...inputs, _note: "Bu modül için otomatik hesaplama henüz bağlanmadı. Sonuçları manuel girebilirsiniz." };
}

// ─── Chart Data Üretici ───

export function computeChartData(moduleKey: ModuleKey, method: string, inputs: Inputs): ChartData | null {
  try {
    switch (moduleKey) {
      case "tasima-kapasitesi":
        return buildBearingChart(method, inputs);
      case "oturma":
        return buildSettlementChart(method, inputs);
      case "yanal-basinc":
        return buildLateralChart(method, inputs);
      case "sev-stabilitesi":
        return buildSlopeChart(method, inputs);
      case "iksa":
        return buildExcavationChart(inputs);
      case "sivilasma":
        return buildLiquefactionChart(inputs);
      case "konsolidasyon":
        return buildConsolidationChart(method, inputs);
      case "arazi-deneyleri":
        return buildFieldTestChart(method, inputs);
      case "indeks-deneyleri":
        return buildIndexTestChart(method, inputs);
      case "faz-iliskileri":
        return buildPhaseChart(method, inputs);
      case "gerilme-temel":
        return buildStressFoundationChart(method, inputs);
      case "kazik":
        return buildPileChart(method, inputs);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function buildBearingChart(method: string, i: Inputs): ChartData | null {
  const base = {
    width: n(i, "width", 2), length: n(i, "length", 2), depth: n(i, "depth", 1.5),
    gamma: n(i, "gamma", 18), cohesion: n(i, "cohesion", 20),
    frictionAngle: n(i, "frictionAngle", 30), safetyFactor: n(i, "safetyFactor", 3),
  };
  if (method.startsWith("Tümü") || method.includes("Tümü")) {
    const results = [
      { name: "Terzaghi", ...terzaghi(base) },
      { name: "Meyerhof", ...meyerhof(base) },
      { name: "Hansen", ...hansen(base) },
      { name: "Vesic", ...vesic(base) },
    ];
    return {
      type: "bearing-comparison",
      data: {
        methods: results.map(r => ({ name: r.name, ultimate: r.ultimate, allowable: r.allowable })),
        safetyFactor: base.safetyFactor,
      },
    };
  }
  const fn = method.includes("Meyerhof") ? meyerhof : method.includes("Hansen") ? hansen : method.includes("Vesic") ? vesic : terzaghi;
  const r = fn(base);
  return {
    type: "bearing-comparison",
    data: {
      methods: [{ name: r.method, ultimate: r.ultimate, allowable: r.allowable }],
      safetyFactor: base.safetyFactor,
    },
  };
}

function buildSettlementChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("Konsolidasyon")) {
    const r = consolidationSettlement({
      thickness: n(i, "thickness", 4), e0: n(i, "e0", 0.8),
      Cc: n(i, "Cc", 0.25), Cs: n(i, "Cs", 0.05),
      sigma0: n(i, "sigma0", 80), deltaSigma: n(i, "deltaSigma", 50),
      preconsolidationPressure: n(i, "preconsolidationPressure", 100),
      cv: n(i, "cv", 2), drainage: (i.drainage as any) || "double",
    });
    if (r.timeSettlement) {
      return {
        type: "settlement-time",
        data: {
          curve: r.timeSettlement.timeDays.map((t, idx) => ({
            time: t / 365,
            U: r.timeSettlement!.degree[idx],
            settlement: r.timeSettlement!.settlement[idx],
          })),
          totalSettlement: r.primarySettlement,
        },
      };
    }
  }
  if (method.includes("Schmertmann")) {
    const r = schmertmannSettlement({
      width: n(i, "width", 2), length: n(i, "length", 2),
      depth: n(i, "depth", 1), pressure: n(i, "pressure", 100),
      gamma: n(i, "gamma", 18),
      layers: [{ depthTop: 0, depthBottom: n(i, "layerThickness", 4), Es: n(i, "Es", 10000) }],
    });
    const B = n(i, "width", 2);
    const isSquare = true;
    return {
      type: "schmertmann",
      data: {
        contributions: r.layerContributions.map(c => ({ depth: c.depth, Iz: c.Iz, Es: c.Es })),
        width: B,
        zMax: isSquare ? 2 * B : 4 * B,
      },
    };
  }
  return null;
}

function buildLateralChart(method: string, i: Inputs): ChartData {
  const base = {
    wallHeight: n(i, "wallHeight", 5), gamma: n(i, "gamma", 18),
    cohesion: n(i, "cohesion", 0), frictionAngle: n(i, "frictionAngle", 30),
    surcharge: n(i, "surcharge", 10),
  };
  const fn = method.includes("Coulomb") ? coulomb : method.includes("Mononobe") ? mononobeOkabe : rankine;
  const extra = method.includes("Coulomb") ? { wallFriction: n(i, "wallFriction", 20) }
    : method.includes("Mononobe") ? { kh: n(i, "kh", 0.2), kv: n(i, "kv", 0.1) } : {};
  const r = fn({ ...base, ...extra });
  return {
    type: "lateral-pressure",
    data: {
      depths: r.activeProfile.depths,
      activePressures: r.activeProfile.pressures,
      passivePressures: r.passiveProfile.pressures,
      wallHeight: base.wallHeight,
      Ka: r.Ka,
      Kp: r.Kp,
    },
  };
}

function buildSlopeChart(method: string, i: Inputs): ChartData {
  const base = {
    height: n(i, "height", 10), slopeAngle: n(i, "slopeAngle", 30),
    gamma: n(i, "gamma", 18), cohesion: n(i, "cohesion", 15),
    frictionAngle: n(i, "frictionAngle", 25), ru: n(i, "ru", 0),
  };
  const fn = method.includes("Janbu") ? janbu : method.includes("Fellenius") ? fellenius : bishop;
  const r = fn(base);
  return {
    type: "slope-stability",
    data: {
      height: base.height,
      slopeAngle: base.slopeAngle,
      center: r.criticalCenter,
      radius: r.criticalRadius,
      FS: r.FS,
      slices: r.slices.map(s => ({ x: s.x, width: s.width })),
    },
  };
}

function buildExcavationChart(i: Inputs): ChartData {
  const r = analyzeRetainingWall({
    excavationDepth: n(i, "excavationDepth", 6), gamma: n(i, "gamma", 18),
    cohesion: n(i, "cohesion", 5), frictionAngle: n(i, "frictionAngle", 28),
    condition: (i.condition as any) || "cantilever",
    supportLevels: i.supportLevels as any,
  });
  return {
    type: "excavation-pressure",
    data: {
      excavationDepth: n(i, "excavationDepth", 6),
      embedmentDepth: r.embedmentDepth,
      pressureDiagram: r.pressureDiagram,
      anchorForces: r.anchorForces,
      supportLevels: i.supportLevels as any,
      Ka: r.Ka,
      Kp: r.Kp,
    },
  };
}

function buildLiquefactionChart(i: Inputs): ChartData | null {
  const layers = (i.layers as any) || [
    { depth: 2, N: 8, finesContent: 15 },
    { depth: 5, N: 12, finesContent: 10 },
    { depth: 8, N: 18, finesContent: 5 },
    { depth: 12, N: 25, finesContent: 5 },
  ];
  const r = evaluateLiquefaction({
    layers,
    magnitude: n(i, "magnitude", 7.5),
    amax: n(i, "amax", 0.4),
    waterTableDepth: n(i, "waterTableDepth", 2),
    gamma: n(i, "gamma", 18),
    gammaSat: n(i, "gammaSat", 20),
  });
  return {
    type: "liquefaction",
    data: {
      layers: r.layers.map(l => ({
        depth: l.depth, CSR: l.CSR, CRR: l.CRR, FS: l.FS, status: l.status,
      })),
      LPI: r.LPI,
    },
  };
}

function buildConsolidationChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("PVD")) {
    const r = pvdAnalysis({
      cv: n(i, "cv", 2), ch: n(i, "ch", 6),
      layerThickness: n(i, "layerThickness", 10), spacing: n(i, "spacing", 1.5),
      pattern: (i.pattern as any) || "triangular",
      drainDiameter: n(i, "drainDiameter", 0.05),
      mandelDiameter: i.mandelDiameter ? n(i, "mandelDiameter", 0.15) : undefined,
      targetDegree: n(i, "targetDegree", 90),
      totalSettlement: i.totalSettlement ? n(i, "totalSettlement", 0.5) : undefined,
    });
    return {
      type: "consolidation-utv",
      data: {
        curve: r.comparison.map(c => ({ Tv: c.time, U: c.U_noPVD })),
        pvdCurve: r.comparison.map(c => ({ Tv: c.time, U: c.U_PVD })),
      },
    };
  }
  const r = consolidationTime({
    cv: n(i, "cv", 2), drainagePath: n(i, "drainagePath", 2),
    targetDegree: n(i, "targetDegree", 90),
    totalSettlement: i.totalSettlement ? n(i, "totalSettlement", 0.5) : undefined,
  });
  return {
    type: "settlement-time",
    data: {
      curve: r.timeCurve.map(c => ({ time: c.time, U: c.U, settlement: c.settlement })),
      totalSettlement: i.totalSettlement ? n(i, "totalSettlement", 0.5) * 1000 : undefined,
    },
  };
}

function buildFieldTestChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("Efektif") || method.includes("Gerilme")) {
    const layers = (i.layers as any) || [
      { thickness: 3, gamma: 17 },
      { thickness: 4, gamma: 18, gammaSat: 20 },
      { thickness: 5, gamma: 19, gammaSat: 21 },
    ];
    const r = stressProfile({ layers, waterTableDepth: n(i, "waterTableDepth", 3), surcharge: n(i, "surcharge", 0) });
    const boundaries: number[] = [];
    let d = 0;
    for (const l of layers) { d += l.thickness; boundaries.push(d); }
    return {
      type: "stress-profile",
      data: {
        profile: r.profile.map(p => ({
          depth: p.depth, totalStress: p.totalStress,
          porePressure: p.porePressure, effectiveStress: p.effectiveStress,
        })),
        waterTableDepth: n(i, "waterTableDepth", 3),
        layerBoundaries: boundaries,
      },
    };
  }
  if (method.includes("SPT")) {
    const points = (i.sptPoints as any) || [
      { depth: 1.5, N: 5, effectiveStress: 27, soilType: "sand" },
      { depth: 3, N: 10, effectiveStress: 54, soilType: "sand" },
      { depth: 6, N: 18, effectiveStress: 100, soilType: "sand" },
      { depth: 9, N: 25, effectiveStress: 145, soilType: "sand" },
      { depth: 12, N: 32, effectiveStress: 190, soilType: "sand" },
    ];
    const results = points.map((p: any) => {
      const r = sptCorrelations({ N: p.N, depth: p.depth, effectiveStress: p.effectiveStress, soilType: p.soilType || "sand" });
      return { depth: p.depth, N60: r.N60, N1_60: r.N1_60 };
    });
    return { type: "spt-profile", data: { points: results } };
  }
  return null;
}

function buildIndexTestChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("Dane")) {
    const data = (i.grainSizeData as any) || [
      { sieveSize: 75, percentPassing: 100 }, { sieveSize: 25, percentPassing: 92 },
      { sieveSize: 4.75, percentPassing: 78 }, { sieveSize: 2, percentPassing: 65 },
      { sieveSize: 0.6, percentPassing: 48 }, { sieveSize: 0.3, percentPassing: 32 },
      { sieveSize: 0.15, percentPassing: 20 }, { sieveSize: 0.075, percentPassing: 12 },
    ];
    const r = grainSizeAnalysis({ data });
    return {
      type: "grain-size",
      data: { data, D10: r.D10, D30: r.D30, D60: r.D60, Cu: r.Cu, Cc: r.Cc },
    };
  }
  return null;
}

function buildPhaseChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("Proctor")) {
    const points = (i.proctorPoints as any) || [
      { waterContent: 8, dryDensity: 17.2 }, { waterContent: 10, dryDensity: 18.1 },
      { waterContent: 12, dryDensity: 18.8 }, { waterContent: 14, dryDensity: 18.5 },
      { waterContent: 16, dryDensity: 17.9 },
    ];
    const r = proctorAnalysis({ points, Gs: n(i, "Gs", 2.65), testType: (i.testType as any) || "standard" });
    return {
      type: "proctor",
      data: {
        points, fitCurve: r.fitCurve, zavCurve: r.zavCurve,
        optimumWaterContent: r.optimumWaterContent, maxDryDensity: r.maxDryDensity,
        gammaD95: r.range95.gammaD95,
      },
    };
  }
  return null;
}

function buildStressFoundationChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("Mohr")) {
    const r = mohrCircle({
      sigma1: n(i, "sigma1", 300), sigma3: n(i, "sigma3", 100),
      cohesion: n(i, "cohesion", 20), frictionAngle: n(i, "frictionAngle", 30),
    });
    return {
      type: "mohr-circle",
      data: {
        sigma1: n(i, "sigma1", 300), sigma3: n(i, "sigma3", 100),
        center: r.center, radius: r.radius,
        cohesion: n(i, "cohesion", 20), frictionAngle: n(i, "frictionAngle", 30),
        circlePoints: r.circlePoints,
      },
    };
  }
  return null;
}

function buildPileChart(method: string, i: Inputs): ChartData | null {
  const pileInput = {
    diameter: n(i, "diameter", 0.6), length: n(i, "length", 15),
    pileType: (i.pileType as any) || "driven",
    layers: (i.layers as any) || [
      { depthTop: 0, depthBottom: 5, soilType: "clay", cu: 40, gamma: 18 },
      { depthTop: 5, depthBottom: 10, soilType: "sand", frictionAngle: 32, gamma: 19 },
      { depthTop: 10, depthBottom: 15, soilType: "sand", frictionAngle: 35, gamma: 20, N: 30 },
    ],
    safetyFactor: n(i, "safetyFactor", 2.5),
  };
  const fn = method.includes("SPT") ? pileCapacitySPT : pileCapacityStatic;
  const r = fn(pileInput);
  return {
    type: "pile-load-transfer",
    data: {
      layers: r.layerDetails.map(l => ({
        depthTop: parseFloat(l.depth.split("-")[0]),
        depthBottom: parseFloat(l.depth.split("-")[1]),
        type: l.type, qs: l.qs, contribution: l.contribution,
      })),
      tipCapacity: r.tipCapacity, shaftCapacity: r.shaftCapacity,
      ultimate: r.ultimate, pileLength: pileInput.length, pileDiameter: pileInput.diameter,
    },
  };
}

// ─── Yardımcılar ───

function n(i: Inputs, key: string, def: number): number {
  const v = i[key];
  if (v === undefined || v === "") return def;
  const num = Number(v);
  return isNaN(num) ? def : num;
}

function flatten(obj: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length > 20) continue; // büyük dizileri atla
    if (typeof v === "object" && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v as any)) {
        if (typeof v2 !== "object") out[`${k}.${k2}`] = v2;
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}
