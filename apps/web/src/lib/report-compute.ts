/**
 * GeoForce — Rapor Hesap Köprüsü
 * Modül key + inputs → engine hesaplama → results
 * + Chart data üretimi
 * + Sıvılaşma modülü bağlantısı
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
  dynamicCompaction, stoneColumn, preloading,
  calculateVs30, siteResponseAnalysis,
  boussinesqPoint, boussinesqRect, cbrCorrelations,
  gravityWallStability, reinforcedSoilDesign,
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
      case "braced-excavation":
      case "destekli-kazi":
        return computeRetaining(inputs);
      case "sivilasma":
        return computeLiquefaction(inputs);
      case "kazik":
        return computePile(method, inputs);
      case "konsolidasyon":
        return computeConsolidation(method, inputs);
      case "arazi-deneyleri":
        return computeFieldTests(method, inputs);
      case "indeks-deneyleri":
        return computeIndexTests(method, inputs);
      case "faz-iliskileri":
        return computePhaseRelations(method, inputs);
      case "gerilme-temel":
        return computeStressFoundation(method, inputs);
      case "siniflandirma":
        return computeClassification(method, inputs);
      case "zemin-iyilestirme":
        return computeSoilImprovement(method, inputs);
      case "istinat-duvari":
        return computeRetainingWallStability(method, inputs);
      case "saha-tepki":
        return computeSiteResponse(method, inputs);
      case "gerilme-dagilimi":
        return computeStressDistribution(method, inputs);
      default:
        return { ...inputs, _note: "Bu modül için otomatik hesaplama henüz bağlanmadı. Sonuçları manuel girebilirsiniz." };
    }
  } catch (e: any) {
    return { _error: e.message || "Hesaplama hatası" };
  }
}

/**
 * Hesaplama + chart data birlikte döndüren wrapper.
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
  if (moduleKey === "sivilasma") {
    const c1 = buildLiquefactionChart(inputs, results);
    if (c1) charts.push(c1);
  } else if (moduleKey === "konsolidasyon") {
    const c1 = buildConsolidationChart(method, inputs);
    if (c1) charts.push(c1);
  } else if (moduleKey === "arazi-deneyleri") {
    const stress = buildFieldTestChart("Efektif", inputs);
    const spt = buildFieldTestChart("SPT", inputs);
    if (method.includes("Efektif") && stress) charts.push(stress);
    if (method.includes("SPT") && spt) charts.push(spt);
    if (!method.includes("Efektif") && !method.includes("SPT")) {
      if (stress) charts.push(stress);
    }
  } else {
    const chart = computeChartData(moduleKey, method, inputs);
    if (chart) charts.push(chart);
  }

  return { results, charts };
}

// ─── Taşıma Kapasitesi ───
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
  if (method.startsWith("Tümü") || method.includes("Tümü")) {
    const all = [
      terzaghi(base),
      meyerhof(base),
      hansen(base),
      vesic(base),
    ];
    return { _multi: true, results: all.map(r => flatten(r)) };
  }
  const fn = method.includes("Meyerhof") ? meyerhof : method.includes("Hansen") ? hansen : method.includes("Vesic") ? vesic : terzaghi;
  const result = fn(base);
  return { method: method.split(" ")[0], ...flatten(result) };
}

// ─── Oturma ───
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

// ─── Yanal Toprak Basıncı ───
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

// ─── Deprem Parametreleri ───
function computeSeismic(i: Inputs) {
  return flatten(calculateSeismicParams({
    Ss: n(i, "Ss", 1.0), S1: n(i, "S1", 0.3),
    soilClass: (i.soilClass as any) || "ZC",
  }));
}

// ─── Şev Stabilitesi ───
function computeSlope(method: string, i: Inputs) {
  const base = {
    height: n(i, "height", 10), slopeAngle: n(i, "slopeAngle", 30),
    gamma: n(i, "gamma", 18), cohesion: n(i, "cohesion", 15),
    frictionAngle: n(i, "frictionAngle", 25), ru: n(i, "ru", 0),
  };
  const fn = method.includes("Janbu") ? janbu : method.includes("Fellenius") ? fellenius : bishop;
  return flatten(fn(base));
}

// ─── İksa ───
function computeRetaining(i: Inputs) {
  return flatten(analyzeRetainingWall({
    excavationDepth: n(i, "excavationDepth", 6), gamma: n(i, "gamma", 18),
    cohesion: n(i, "cohesion", 5), frictionAngle: n(i, "frictionAngle", 28),
    condition: (i.condition as any) || "cantilever",
  }));
}

// ─── Sıvılaşma ───
function computeLiquefaction(i: Inputs): Record<string, any> {
  // Tabaka formatını dönüştür
  const layers = i.layers || [
    { depth: n(i, "depth", 5), N: n(i, "N", 15), finesContent: n(i, "finesContent", 15) },
  ];

  const result = evaluateLiquefaction({
    layers,
    magnitude: n(i, "magnitude", 7.5),
    amax: n(i, "amax", 0.4),
    waterTableDepth: n(i, "waterTableDepth", 2),
    gamma: n(i, "gamma", 18),
    gammaSat: n(i, "gammaSat", 20),
  });

  // Sonuçları düzleştir
  const flatResults: Record<string, any> = {
    method: result.method,
    LPI: result.LPI,
    riskLevel: result.riskLevel,
    riskLevelTR: result.riskLevelTR,
  };

  // Tabaka sonuçlarını ekle
  result.layers.forEach((layer, idx) => {
    flatResults[`layers.${idx}.depth`] = layer.depth;
    flatResults[`layers.${idx}.N160cs`] = layer.N160cs;
    flatResults[`layers.${idx}.CSR`] = layer.CSR;
    flatResults[`layers.${idx}.CRR`] = layer.CRR;
    flatResults[`layers.${idx}.MSF`] = layer.MSF;
    flatResults[`layers.${idx}.FS`] = layer.FS;
    flatResults[`layers.${idx}.status`] = layer.status;
  });

  // Orijinal tabaka verilerini de sakla (grafik için)
  flatResults._layerDetails = result.layers;
  flatResults._magnitude = n(i, "magnitude", 7.5);
  flatResults._amax = n(i, "amax", 0.4);
  flatResults._waterTableDepth = n(i, "waterTableDepth", 2);

  return flatResults;
}

// ─── Kazık ───
function computePile(method: string, i: Inputs) {
  const pileInput = {
    diameter: n(i, "diameter", 0.6),
    length: n(i, "length", 15),
    pileType: (i.pileType as any) || "driven",
    layers: i.layers || [
      { depthTop: 0, depthBottom: 5, soilType: "clay", cu: n(i, "cu", 40), gamma: n(i, "gamma", 18) },
      { depthTop: 5, depthBottom: 10, soilType: "sand", frictionAngle: n(i, "frictionAngle", 30), gamma: n(i, "gamma", 18) },
      { depthTop: 10, depthBottom: 15, soilType: "sand", frictionAngle: n(i, "frictionAngle", 32), gamma: n(i, "gamma", 18), N: n(i, "N", 20) },
    ],
    safetyFactor: n(i, "safetyFactor", 2.5),
  };
  const fn = method.includes("SPT") ? pileCapacitySPT : pileCapacityStatic;
  return flatten(fn(pileInput));
}

// ─── Konsolidasyon ───
function computeConsolidation(method: string, i: Inputs) {
  if (method.includes("PVD")) {
    return flatten(pvdAnalysis({
      cv: n(i, "cv", 2), ch: n(i, "ch", 6),
      layerThickness: n(i, "layerThickness", 10), spacing: n(i, "spacing", 1.5),
      pattern: (i.pattern as any) || "triangular",
      drainDiameter: n(i, "drainDiameter", 0.05),
      mandelDiameter: i.mandelDiameter ? n(i, "mandelDiameter", 0.15) : undefined,
      targetDegree: n(i, "targetDegree", 90),
      totalSettlement: i.totalSettlement ? n(i, "totalSettlement", 0.5) : undefined,
    }));
  }
  return flatten(consolidationTime({
    cv: n(i, "cv", 2), drainagePath: n(i, "drainagePath", 2),
    targetDegree: n(i, "targetDegree", 90),
    totalSettlement: i.totalSettlement ? n(i, "totalSettlement", 0.5) : undefined,
  }));
}

// ─── Arazi Deneyleri ───
function computeFieldTests(method: string, i: Inputs) {
  if (method.includes("Efektif") || method.includes("Gerilme")) {
    const layers = i.layers || [
      { thickness: 3, gamma: n(i, "gamma", 17) },
      { thickness: 4, gamma: n(i, "gamma", 18), gammaSat: n(i, "gammaSat", 20) },
      { thickness: 5, gamma: n(i, "gamma", 19), gammaSat: n(i, "gammaSat", 21) },
    ];
    return flatten(stressProfile({ layers, waterTableDepth: n(i, "waterTableDepth", 3), surcharge: n(i, "surcharge", 0) }));
  }
  if (method.includes("SPT")) {
    return flatten(sptCorrelations({ N: n(i, "N", 15), depth: n(i, "depth", 5), effectiveStress: n(i, "effectiveStress", 50), soilType: i.soilType || "sand" }));
  }
  return { _note: "Yöntem seçili değil" };
}

// ─── İndeks Deneyleri ───
function computeIndexTests(method: string, i: Inputs) {
  if (method.includes("Dane")) {
    const data = i.grainSizeData || [
      { sieveSize: 75, percentPassing: 100 },
      { sieveSize: 4.75, percentPassing: 78 },
      { sieveSize: 0.075, percentPassing: 12 },
    ];
    return flatten(grainSizeAnalysis({ data }));
  }
  // Atterberg
  const LL = n(i, "LL", 45);
  const PL = n(i, "PL", 22);
  return { LL, PL, PI: LL - PL, method: "Atterberg Limitleri" };
}

// ─── Faz İlişkileri ───
function computePhaseRelations(method: string, i: Inputs) {
  if (method.includes("Proctor")) {
    const points = i.proctorPoints || [
      { waterContent: 8, dryDensity: 17.2 },
      { waterContent: 12, dryDensity: 18.8 },
      { waterContent: 16, dryDensity: 17.9 },
    ];
    return flatten(proctorAnalysis({ points, Gs: n(i, "Gs", 2.65), testType: (i.testType as any) || "standard" }));
  }
  // Temel faz hesabı
  const Gs = n(i, "Gs", 2.65);
  const w = n(i, "w", 20) / 100;
  const gamma = n(i, "gamma", 18);
  const gammaW = 9.81;
  const e = (Gs * gammaW * (1 + w) / gamma) - 1;
  const porosity = e / (1 + e);
  const S = (Gs * w) / e * 100;
  return { Gs, w: w * 100, gamma, e: e.toFixed(3), n: porosity.toFixed(3), S: S.toFixed(1) };
}

// ─── Gerilme & Temel ───
function computeStressFoundation(method: string, i: Inputs) {
  if (method.includes("Mohr")) {
    return flatten(mohrCircle({
      sigma1: n(i, "sigma1", 300), sigma3: n(i, "sigma3", 100),
      cohesion: n(i, "cohesion", 20), frictionAngle: n(i, "frictionAngle", 30),
    }));
  }
  return { _note: "Yöntem seçili değil" };
}

// ─── Sınıflandırma ───
function computeClassification(method: string, i: Inputs) {
  const gravel = n(i, "gravel", 20);
  const sand = n(i, "sand", 45);
  const fines = n(i, "fines", 35);
  const LL = n(i, "LL", 40);
  const PL = n(i, "PL", 20);
  const PI = LL - PL;

  // Basit USCS sınıflaması
  let USCS = "";
  if (fines > 50) {
    if (PI < 7) USCS = fines > 85 ? "ML" : "CL-ML";
    else if (PI > LL - 20 || PI > 25) USCS = "CH";
    else USCS = "CL";
  } else if (gravel > sand) {
    USCS = fines > 12 ? "GC" : "GW";
  } else {
    USCS = fines > 12 ? "SC" : "SW";
  }

  return {
    gravel, sand, fines, LL, PL, PI, USCS,
    method: method.includes("AASHTO") ? "AASHTO" : method.includes("TBDY") ? "TBDY 2018" : "USCS",
  };
}

// ─── Zemin İyileştirme ───
function computeSoilImprovement(method: string, i: Inputs) {
  if (method.includes("Dinamik")) {
    return flatten(dynamicCompaction({
      weight: n(i, "weight", 15),
      dropHeight: n(i, "dropHeight", 15),
      targetDepth: n(i, "targetDepth", 8),
      soilType: (i.soilType as any) || "granular",
    }));
  }
  if (method.includes("Taş") || method.includes("Kolon")) {
    return flatten(stoneColumn({
      diameter: n(i, "diameter", 0.8),
      spacing: n(i, "spacing", 2),
      pattern: (i.pattern as any) || "triangular",
      columnFrictionAngle: n(i, "columnFrictionAngle", 40),
      soilCu: n(i, "soilCu", 30),
      soilGamma: n(i, "soilGamma", 18),
      appliedStress: n(i, "appliedStress", 100),
      length: n(i, "length", 10),
    }));
  }
  if (method.includes("Ön") || method.includes("Preloading")) {
    return flatten(preloading({
      targetSettlement: n(i, "targetSettlement", 0.1),
      cv: n(i, "cv", 2),
      drainagePath: n(i, "drainagePath", 2),
      effectiveStress: n(i, "effectiveStress", 50),
      Cc: n(i, "Cc", 0.3),
      layerThickness: n(i, "layerThickness", 5),
      e0: n(i, "e0", 0.8),
      targetTime: n(i, "targetTime", 1),
    }));
  }
  return { _note: "Yöntem seçili değil" };
}

// ─── İstinat Duvarı Stabilitesi ───
function computeRetainingWallStability(method: string, i: Inputs) {
  if (method.includes("Ağırlık") || method.includes("Gravity")) {
    return flatten(gravityWallStability({
      height: n(i, "height", 4),
      baseWidth: n(i, "baseWidth", 2.5),
      topWidth: n(i, "topWidth", 0.5),
      gammaWall: n(i, "gammaWall", 24),
      gammaFill: n(i, "gammaFill", 18),
      frictionAngle: n(i, "frictionAngle", 30),
      cohesion: n(i, "cohesion", 0),
      bearingCapacity: n(i, "bearingCapacity", 200),
      surcharge: n(i, "surcharge", 10),
    }));
  }
  if (method.includes("Donatılı") || method.includes("Reinforced")) {
    return flatten(reinforcedSoilDesign({
      height: n(i, "height", 6),
      gamma: n(i, "gamma", 18),
      frictionAngle: n(i, "frictionAngle", 32),
      surcharge: n(i, "surcharge", 10),
      geogridStrength: n(i, "geogridStrength", 100),
      verticalSpacing: n(i, "verticalSpacing", 0.6),
    }));
  }
  return { _note: "Yöntem seçili değil" };
}

// ─── Saha Tepki ───
function computeSiteResponse(method: string, i: Inputs) {
  const layers = i.layers || [
    { thickness: n(i, "thickness", 10), vs: n(i, "Vs", 200), gamma: n(i, "density", 18) },
  ];
  
  if (method.includes("Vs30")) {
    return flatten(calculateVs30(layers));
  }
  if (method.includes("Transfer")) {
    return flatten(siteResponseAnalysis({
      layers,
      rockPGA: n(i, "rockPGA", 0.3),
      magnitude: n(i, "magnitude", 7.5),
    }));
  }
  return { _note: "Yöntem seçili değil" };
}

// ─── Gerilme Dağılımı & CBR ───
function computeStressDistribution(method: string, i: Inputs) {
  if (method.includes("Boussinesq")) {
    return flatten(boussinesqPoint({
      load: n(i, "load", 100),
      depth: n(i, "depth", 3),
      radialDistance: n(i, "radialDistance", 1),
    }));
  }
  if (method.includes("CBR")) {
    return flatten(cbrCorrelations({
      cbr: n(i, "cbr", 15),
    }));
  }
  return { _note: "Yöntem seçili değil" };
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
      case "braced-excavation":
      case "destekli-kazi":
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
        methods: results.map(r => ({ name: r.method || r.name, ultimate: r.ultimate, allowable: r.allowable })),
        safetyFactor: base.safetyFactor,
      },
    };
  }
  const fn = method.includes("Meyerhof") ? meyerhof : method.includes("Hansen") ? hansen : method.includes("Vesic") ? vesic : terzaghi;
  const r = fn(base);
  return {
    type: "bearing-comparison",
    data: {
      methods: [{ name: r.method || method.split(" ")[0], ultimate: r.ultimate, allowable: r.allowable }],
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
      slices: r.slices?.map(s => ({ x: s.x, width: s.width })) || [],
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

function buildLiquefactionChart(i: Inputs, results?: Record<string, any>): ChartData | null {
  const layerDetails = results?._layerDetails;
  if (!layerDetails || !Array.isArray(layerDetails)) return null;

  return {
    type: "liquefaction",
    data: {
      layers: layerDetails.map((l: any) => ({
        depth: l.depth,
        CSR: l.CSR,
        CRR: l.CRR,
        FS: l.FS,
        status: l.status,
      })),
      LPI: results?.LPI || 0,
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
      targetDegree: n(i, "targetDegree", 90),
    });
    return {
      type: "consolidation-utv",
      data: {
        curve: r.comparison?.map((c: any) => ({ Tv: c.time, U: c.U_noPVD })) || [],
        pvdCurve: r.comparison?.map((c: any) => ({ Tv: c.time, U: c.U_PVD })) || [],
      },
    };
  }
  const r = consolidationTime({
    cv: n(i, "cv", 2), drainagePath: n(i, "drainagePath", 2),
    targetDegree: n(i, "targetDegree", 90),
  });
  return {
    type: "settlement-time",
    data: {
      curve: r.timeCurve?.map((c: any) => ({ time: c.time, U: c.U, settlement: c.settlement })) || [],
    },
  };
}

function buildFieldTestChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("Efektif") || method.includes("Gerilme")) {
    const layers = i.layers || [
      { thickness: 3, gamma: 17 },
      { thickness: 4, gamma: 18, gammaSat: 20 },
    ];
    const r = stressProfile({ layers, waterTableDepth: n(i, "waterTableDepth", 3) });
    const boundaries: number[] = [];
    let d = 0;
    for (const l of layers) { d += l.thickness; boundaries.push(d); }
    return {
      type: "stress-profile",
      data: {
        profile: r.profile.map((p: any) => ({
          depth: p.depth, totalStress: p.totalStress,
          porePressure: p.porePressure, effectiveStress: p.effectiveStress,
        })),
        waterTableDepth: n(i, "waterTableDepth", 3),
        layerBoundaries: boundaries,
      },
    };
  }
  return null;
}

function buildIndexTestChart(method: string, i: Inputs): ChartData | null {
  if (method.includes("Dane")) {
    const data = i.grainSizeData || [
      { sieveSize: 75, percentPassing: 100 },
      { sieveSize: 4.75, percentPassing: 78 },
      { sieveSize: 0.075, percentPassing: 12 },
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
    const points = i.proctorPoints || [
      { waterContent: 8, dryDensity: 17.2 },
      { waterContent: 12, dryDensity: 18.8 },
      { waterContent: 16, dryDensity: 17.9 },
    ];
    const r = proctorAnalysis({ points, Gs: n(i, "Gs", 2.65), testType: (i.testType as any) || "standard" });
    return {
      type: "proctor",
      data: {
        points, fitCurve: r.fitCurve || [], zavCurve: r.zavCurve || [],
        optimumWaterContent: r.optimumWaterContent, maxDryDensity: r.maxDryDensity,
        gammaD95: r.range95?.gammaD95,
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
    layers: i.layers || [
      { depthTop: 0, depthBottom: 5, soilType: "clay", cu: 40, gamma: 18 },
      { depthTop: 5, depthBottom: 10, soilType: "sand", frictionAngle: 32, gamma: 19 },
    ],
    safetyFactor: n(i, "safetyFactor", 2.5),
  };
  const fn = method.includes("SPT") ? pileCapacitySPT : pileCapacityStatic;
  const r = fn(pileInput);
  return {
    type: "pile-load-transfer",
    data: {
      layers: r.layerDetails?.map((l: any) => ({
        depthTop: parseFloat(l.depth?.split("-")[0] || "0"),
        depthBottom: parseFloat(l.depth?.split("-")[1] || "0"),
        type: l.type, qs: l.qs, contribution: l.contribution,
      })) || [],
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
    if (Array.isArray(v) && v.length > 20) continue;
    if (typeof v === "object" && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v as any)) {
        if (typeof v2 !== "object" || (Array.isArray(v2) && v2.length <= 20)) {
          out[`${k}.${k2}`] = v2;
        }
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}
