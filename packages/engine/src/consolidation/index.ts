/**
 * GeoForce Engine — İleri Konsolidasyon Analizi
 * Cv hesabı, zaman-oturma, konsolidasyon derecesi, kum dren (PVD)
 */

export interface ConsolidationTimeInput {
  /** Konsolidasyon katsayısı Cv (m²/yıl) */
  cv: number;
  /** Drenaj yolu uzunluğu Hdr (m) — tek yönlü: tabaka kalınlığı/2 */
  drainagePath: number;
  /** Hedef konsolidasyon derecesi U (%) */
  targetDegree?: number;
  /** Hedef süre (yıl) — U hesabı için */
  targetTime?: number;
  /** Toplam konsolidasyon oturması Sc (m) */
  totalSettlement?: number;
}

export interface ConsolidationTimeResult {
  method: string;
  /** Konsolidasyon derecesi U (%) — targetTime verilmişse */
  degreeOfConsolidation?: number;
  /** Gerekli süre (yıl) — targetDegree verilmişse */
  requiredTime?: number;
  /** Oturma miktarı (m) — totalSettlement verilmişse */
  currentSettlement?: number;
  /** Zaman-oturma eğrisi */
  timeCurve: { time: number; U: number; settlement?: number }[];
  /** Tv değeri */
  Tv: number;
}

export interface PVDInput {
  /** Konsolidasyon katsayısı Cv (m²/yıl) */
  cv: number;
  /** Yatay konsolidasyon katsayısı Ch (m²/yıl) — genelde 2-5 × Cv */
  ch: number;
  /** Tabaka kalınlığı H (m) */
  layerThickness: number;
  /** Dren aralığı s (m) */
  spacing: number;
  /** Dren düzeni: kare veya üçgen */
  pattern: "square" | "triangular";
  /** Dren çapı dw (m) — eşdeğer */
  drainDiameter: number;
  /** Mandrel çapı dm (m) — smear zone */
  mandelDiameter?: number;
  /** Hedef konsolidasyon derecesi U (%) */
  targetDegree: number;
  /** Toplam konsolidasyon oturması Sc (m) */
  totalSettlement?: number;
}

export interface PVDResult {
  method: string;
  /** Etki alanı çapı De (m) */
  influenceDiameter: number;
  /** n = De/dw oranı */
  n: number;
  /** Smear zone oranı s = ds/dw */
  smearRatio: number;
  /** Drensiz süre (yıl) */
  timeWithoutPVD: number;
  /** Drenli süre (yıl) */
  timeWithPVD: number;
  /** Hızlanma oranı */
  speedupFactor: number;
  /** Zaman-oturma karşılaştırma */
  comparison: { time: number; U_noPVD: number; U_PVD: number }[];
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// U → Tv dönüşümü
function UtoTv(U: number): number {
  const u = U / 100;
  if (u < 0.526) return (Math.PI / 4) * u * u;
  return -0.933 * Math.log10(1 - u) - 0.085;
}

// Tv → U dönüşümü
function TvToU(Tv: number): number {
  // Newton-Raphson
  let U = 50;
  for (let i = 0; i < 50; i++) {
    const tv = UtoTv(U);
    const diff = tv - Tv;
    if (Math.abs(diff) < 0.0001) break;
    // Derivative approximation
    const tvPlus = UtoTv(U + 0.1);
    const dTv = (tvPlus - tv) / 0.1;
    if (Math.abs(dTv) < 1e-10) break;
    U -= diff / dTv;
    U = Math.max(0.1, Math.min(99.9, U));
  }
  return round(U, 1);
}

export function consolidationTime(input: ConsolidationTimeInput): ConsolidationTimeResult {
  const { cv, drainagePath, targetDegree, targetTime, totalSettlement } = input;

  let Tv: number;
  let degreeOfConsolidation: number | undefined;
  let requiredTime: number | undefined;
  let currentSettlement: number | undefined;

  if (targetTime !== undefined) {
    Tv = (cv * targetTime) / (drainagePath * drainagePath);
    degreeOfConsolidation = TvToU(Tv);
    if (totalSettlement) currentSettlement = round((degreeOfConsolidation / 100) * totalSettlement, 4);
  } else if (targetDegree !== undefined) {
    Tv = UtoTv(targetDegree);
    requiredTime = round((Tv * drainagePath * drainagePath) / cv, 3);
    if (totalSettlement) currentSettlement = round((targetDegree / 100) * totalSettlement, 4);
  } else {
    Tv = 0;
  }

  // Zaman-oturma eğrisi
  const timeCurve: ConsolidationTimeResult["timeCurve"] = [];
  const maxTime = requiredTime ? requiredTime * 1.5 : targetTime ? targetTime * 2 : 10;
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * maxTime;
    const tv = (cv * t) / (drainagePath * drainagePath);
    const U = TvToU(tv);
    timeCurve.push({
      time: round(t, 3),
      U: round(U, 1),
      settlement: totalSettlement ? round((U / 100) * totalSettlement, 4) : undefined,
    });
  }

  return {
    method: "Terzaghi 1D Konsolidasyon (Zaman Analizi)",
    degreeOfConsolidation,
    requiredTime,
    currentSettlement,
    timeCurve,
    Tv: round(Tv!, 4),
  };
}

export function pvdAnalysis(input: PVDInput): PVDResult {
  const { cv, ch, layerThickness, spacing, pattern, drainDiameter, mandelDiameter, targetDegree, totalSettlement } = input;

  // Etki alanı çapı
  const De = pattern === "square" ? 1.128 * spacing : 1.05 * spacing;

  const dw = drainDiameter;
  const n = De / dw;

  // Smear zone
  const ds = mandelDiameter ? mandelDiameter * 2 : dw * 3;
  const smearRatio = ds / dw;

  // Hansbo (1981) — F(n) fonksiyonu
  const Fn = Math.log(n / smearRatio) + (smearRatio * smearRatio - 1) / (n * n) * Math.log(smearRatio) + (n * n - smearRatio * smearRatio) / (4 * n * n);

  // Drensiz süre (sadece düşey)
  const Hdr = layerThickness / 2;
  const TvTarget = UtoTv(targetDegree);
  const timeNoPVD = (TvTarget * Hdr * Hdr) / cv;

  // Drenli süre — yatay konsolidasyon
  // Uh = 1 - exp(-8*Ch*t / (De² * F(n)))
  // t = -De² * F(n) * ln(1 - Uh) / (8 * Ch)
  const Uh = targetDegree / 100;
  const timePVD = (-De * De * Fn * Math.log(1 - Math.min(Uh, 0.999))) / (8 * ch);

  const speedup = timeNoPVD / Math.max(timePVD, 0.001);

  // Karşılaştırma eğrisi
  const maxT = Math.max(timeNoPVD * 1.2, 1);
  const comparison: PVDResult["comparison"] = [];
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30) * maxT;
    const tvV = (cv * t) / (Hdr * Hdr);
    const UnoP = TvToU(tvV);
    const UhVal = (1 - Math.exp((-8 * ch * t) / (De * De * Fn))) * 100;
    // Birleşik: U = 1 - (1-Uv)(1-Uh)
    const Ucombined = (1 - (1 - TvToU(tvV) / 100) * (1 - Math.min(UhVal, 99.9) / 100)) * 100;
    comparison.push({ time: round(t, 3), U_noPVD: round(UnoP, 1), U_PVD: round(Math.min(Ucombined, 99.9), 1) });
  }

  return {
    method: "Hansbo (1981) PVD Analizi",
    influenceDiameter: round(De, 3),
    n: round(n, 1),
    smearRatio: round(smearRatio, 1),
    timeWithoutPVD: round(timeNoPVD, 2),
    timeWithPVD: round(timePVD, 2),
    speedupFactor: round(speedup, 1),
    comparison,
  };
}
