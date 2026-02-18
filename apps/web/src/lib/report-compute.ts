/**
 * GeoForce — Rapor Hesap Köprüsü
 * Modül key + inputs → engine hesaplama → results
 */
import {
  terzaghi, meyerhof, hansen, vesic,
  elasticSettlement, consolidationSettlement, schmertmannSettlement,
  rankine, coulomb, mononobeOkabe,
  calculateSeismicParams,
  bishop, janbu, fellenius,
  analyzeRetainingWall,
} from "@geoforce/engine";
import type { ModuleKey } from "./report-store";

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
