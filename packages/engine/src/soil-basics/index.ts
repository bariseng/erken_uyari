/**
 * GeoForce Engine — Zemin Faz İlişkileri
 * Boşluk oranı, porozite, doygunluk, birim hacim ağırlıklar, faz diyagramı
 */

export interface PhaseInput {
  /** Hesap modu */
  mode: "from_weights" | "from_ratios";
  /** Toplam ağırlık Wt (kN veya g) — from_weights */
  totalWeight?: number;
  /** Katı ağırlık Ws (kN veya g) — from_weights */
  solidWeight?: number;
  /** Su ağırlık Ww (kN veya g) — from_weights */
  waterWeight?: number;
  /** Toplam hacim Vt (m³ veya cm³) — from_weights */
  totalVolume?: number;
  /** Dane özgül ağırlığı Gs */
  Gs?: number;
  /** Boşluk oranı e — from_ratios */
  voidRatio?: number;
  /** Doygunluk derecesi S (%) — from_ratios */
  saturation?: number;
  /** Su birim hacim ağırlığı γw (kN/m³) — varsayılan 9.81 */
  gammaW?: number;
}

export interface PhaseResult {
  /** Boşluk oranı e */
  voidRatio: number;
  /** Porozite n (%) */
  porosity: number;
  /** Doygunluk derecesi S (%) */
  saturation: number;
  /** Su muhtevası w (%) */
  waterContent: number;
  /** Doğal birim hacim ağırlık γ (kN/m³) */
  gammaNat: number;
  /** Kuru birim hacim ağırlık γd (kN/m³) */
  gammaDry: number;
  /** Doygun birim hacim ağırlık γsat (kN/m³) */
  gammaSat: number;
  /** Batık birim hacim ağırlık γ' (kN/m³) */
  gammaSub: number;
  /** Dane özgül ağırlığı Gs */
  Gs: number;
  /** Faz hacimleri (normalize) */
  phases: { Vs: number; Vw: number; Va: number; Vv: number; Vt: number };
  /** Faz ağırlıkları (normalize) */
  weights: { Ws: number; Ww: number; Wt: number };
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export function soilPhaseRelations(input: PhaseInput): PhaseResult {
  const gammaW = input.gammaW ?? 9.81;
  const Gs = input.Gs ?? 2.65;

  let e: number, S: number, w: number;

  if (input.mode === "from_weights" && input.totalWeight && input.solidWeight && input.totalVolume) {
    const Wt = input.totalWeight;
    const Ws = input.solidWeight;
    const Ww = input.waterWeight ?? (Wt - Ws);
    const Vt = input.totalVolume;

    w = (Ww / Ws) * 100;
    const Vs = Ws / (Gs * gammaW);
    const Vw = Ww / gammaW;
    const Vv = Vt - Vs;
    e = Vv / Vs;
    S = Vv > 0 ? (Vw / Vv) * 100 : 0;
  } else {
    // from_ratios
    e = input.voidRatio ?? 0.7;
    S = input.saturation ?? 50;
    w = (S / 100) * e / Gs * 100;
  }

  const n = (e / (1 + e)) * 100;

  // Birim hacim ağırlıklar
  const gammaDry = (Gs * gammaW) / (1 + e);
  const gammaNat = ((Gs + (S / 100) * e) * gammaW) / (1 + e);
  const gammaSat = ((Gs + e) * gammaW) / (1 + e);
  const gammaSub = gammaSat - gammaW;

  // Normalize faz hacimleri (Vs = 1 birim)
  const Vs = 1;
  const Vv = e;
  const Vw = (S / 100) * e;
  const Va = Vv - Vw;
  const Vt = 1 + e;

  const Ws = Gs * gammaW;
  const Ww = Vw * gammaW;
  const Wt = Ws + Ww;

  return {
    voidRatio: round(e, 3),
    porosity: round(n, 1),
    saturation: round(S, 1),
    waterContent: round(w, 1),
    gammaNat: round(gammaNat, 2),
    gammaDry: round(gammaDry, 2),
    gammaSat: round(gammaSat, 2),
    gammaSub: round(gammaSub, 2),
    Gs,
    phases: { Vs: round(Vs, 3), Vw: round(Vw, 3), Va: round(Va, 3), Vv: round(Vv, 3), Vt: round(Vt, 3) },
    weights: { Ws: round(Ws, 2), Ww: round(Ww, 2), Wt: round(Wt, 2) },
  };
}

/**
 * Kompaksiyon — Proctor Eğrisi Analizi
 */
export interface ProctorPoint {
  waterContent: number; // w (%)
  dryDensity: number;   // γd (kN/m³)
}

export interface ProctorInput {
  /** Deney noktaları */
  points: ProctorPoint[];
  /** Dane özgül ağırlığı Gs */
  Gs?: number;
  /** Test tipi */
  testType: "standard" | "modified";
}

export interface ProctorResult {
  method: string;
  /** Optimum su muhtevası wopt (%) */
  optimumWaterContent: number;
  /** Maksimum kuru birim hacim ağırlık γd_max (kN/m³) */
  maxDryDensity: number;
  /** Sıfır hava boşluğu eğrisi (ZAV) */
  zavCurve: { w: number; gammaDZav: number }[];
  /** Polinom fit eğrisi */
  fitCurve: { w: number; gammaD: number }[];
  /** Bağıl sıkılık %95 aralığı */
  range95: { wMin: number; wMax: number; gammaD95: number };
}

export function proctorAnalysis(input: ProctorInput): ProctorResult {
  const { points, Gs = 2.65, testType } = input;
  const gammaW = 9.81;

  if (points.length < 3) {
    return {
      method: testType === "standard" ? "Standart Proctor (ASTM D698)" : "Modifiye Proctor (ASTM D1557)",
      optimumWaterContent: 0, maxDryDensity: 0,
      zavCurve: [], fitCurve: [],
      range95: { wMin: 0, wMax: 0, gammaD95: 0 },
    };
  }

  // 2. derece polinom fit (en basit yaklaşım)
  // γd = a*w² + b*w + c
  const n = points.length;
  let Sw = 0, Sw2 = 0, Sw3 = 0, Sw4 = 0, Sg = 0, Swg = 0, Sw2g = 0;
  for (const p of points) {
    const w = p.waterContent;
    const g = p.dryDensity;
    Sw += w; Sw2 += w * w; Sw3 += w * w * w; Sw4 += w * w * w * w;
    Sg += g; Swg += w * g; Sw2g += w * w * g;
  }

  // Normal denklemler: [n, Sw, Sw2; Sw, Sw2, Sw3; Sw2, Sw3, Sw4] * [c,b,a] = [Sg, Swg, Sw2g]
  // Cramer kuralı
  const D = n * (Sw2 * Sw4 - Sw3 * Sw3) - Sw * (Sw * Sw4 - Sw3 * Sw2) + Sw2 * (Sw * Sw3 - Sw2 * Sw2);
  const Dc = Sg * (Sw2 * Sw4 - Sw3 * Sw3) - Sw * (Swg * Sw4 - Sw2g * Sw3) + Sw2 * (Swg * Sw3 - Sw2g * Sw2);
  const Db = n * (Swg * Sw4 - Sw2g * Sw3) - Sg * (Sw * Sw4 - Sw3 * Sw2) + Sw2 * (Sw * Sw2g - Swg * Sw2);
  const Da = n * (Sw2 * Sw2g - Sw3 * Swg) - Sw * (Sw * Sw2g - Swg * Sw2) + Sg * (Sw * Sw3 - Sw2 * Sw2);

  const c = D !== 0 ? Dc / D : 0;
  const b = D !== 0 ? Db / D : 0;
  const a = D !== 0 ? Da / D : 0;

  // Optimum: dγd/dw = 2a*w + b = 0 → wopt = -b/(2a)
  const wopt = a !== 0 ? round(-b / (2 * a), 1) : points.reduce((best, p) => p.dryDensity > best.dryDensity ? p : best).waterContent;
  const gdMax = round(a * wopt * wopt + b * wopt + c, 2);

  // ZAV eğrisi: γd = Gs * γw / (1 + w/100 * Gs)
  const wMin = Math.max(0, Math.min(...points.map(p => p.waterContent)) - 5);
  const wMax = Math.max(...points.map(p => p.waterContent)) + 5;
  const zavCurve: ProctorResult["zavCurve"] = [];
  const fitCurve: ProctorResult["fitCurve"] = [];
  for (let w = wMin; w <= wMax; w += 0.5) {
    zavCurve.push({ w: round(w, 1), gammaDZav: round((Gs * gammaW) / (1 + (w / 100) * Gs), 2) });
    fitCurve.push({ w: round(w, 1), gammaD: round(a * w * w + b * w + c, 2) });
  }

  // %95 aralığı
  const gd95 = round(gdMax * 0.95, 2);
  // a*w² + b*w + (c - gd95) = 0
  const disc = b * b - 4 * a * (c - gd95);
  let w95Min = wopt - 3, w95Max = wopt + 3;
  if (disc >= 0 && a !== 0) {
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    w95Min = round(Math.min(r1, r2), 1);
    w95Max = round(Math.max(r1, r2), 1);
  }

  return {
    method: testType === "standard" ? "Standart Proctor (ASTM D698)" : "Modifiye Proctor (ASTM D1557)",
    optimumWaterContent: wopt,
    maxDryDensity: gdMax,
    zavCurve,
    fitCurve,
    range95: { wMin: w95Min, wMax: w95Max, gammaD95: gd95 },
  };
}

// ─── Kil Efektif Sürtünme Açısı Tahmini ───

export interface ClayFrictionInput {
  /** Plastisite indeksi PI (%) */
  plasticityIndex: number;
  /** Likit limit LL (%) */
  liquidLimit: number;
}

export interface ClayFrictionResult {
  method: string;
  /** Tahmini efektif sürtünme açısı φ' (derece) */
  frictionAngle: number;
  /** Kullanılan yöntem açıklaması */
  description: string;
  /** Beklenen aralık (derece) */
  range: { min: number; max: number };
}

/**
 * Kil efektif sürtünme açısı tahmini — PI'den
 * Sorensen & Okkels (2013) yaklaşımı: φ' = 43 - 10·ln(PI)
 * Kenney (1959), Bjerrum & Simons (1960) referansları
 */
export function clayEffectiveFriction(input: ClayFrictionInput): ClayFrictionResult {
  const { plasticityIndex: PI, liquidLimit: LL } = input;

  // Sorensen & Okkels (2013) — ana formül
  const phi = 43 - 10 * Math.log(PI);

  // Aralık tahmini: ±3-5 derece (PI'ye bağlı belirsizlik)
  const spread = PI < 20 ? 3 : PI < 50 ? 4 : 5;
  const phiMin = Math.max(phi - spread, 10);
  const phiMax = Math.min(phi + spread, 40);

  // Yöntem seçimi açıklaması
  let description: string;
  if (PI < 15) {
    description = "Düşük plastisiteli kil — φ' yüksek, kumsu davranış beklenir";
  } else if (PI < 40) {
    description = "Orta plastisiteli kil — Kenney (1959) ve Bjerrum & Simons (1960) ile uyumlu";
  } else if (PI < 75) {
    description = "Yüksek plastisiteli kil — φ' düşük, rezidüel dayanım kontrol edilmeli";
  } else {
    description = "Çok yüksek plastisiteli kil — rezidüel dayanım kritik, φ'r ayrıca değerlendirilmeli";
  }

  return {
    method: "Sorensen & Okkels (2013) — φ' = 43 - 10·ln(PI)",
    frictionAngle: round(Math.max(phi, 8), 1),
    description,
    range: { min: round(phiMin, 1), max: round(phiMax, 1) },
  };
}
