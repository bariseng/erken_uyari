/**
 * GeoForce Engine — Oturma Hesabı
 * Elastik oturma, 1D konsolidasyon, Schmertmann yöntemi
 */

export interface ElasticSettlementInput {
  /** Temel genişliği B (m) */
  width: number;
  /** Temel uzunluğu L (m) */
  length?: number;
  /** Net taban basıncı q (kPa) */
  pressure: number;
  /** Elastisite modülü Es (kPa) */
  elasticModulus: number;
  /** Poisson oranı ν */
  poissonRatio?: number;
  /** Temel rijitliği faktörü — varsayılan "flexible" */
  rigidity?: "flexible" | "rigid";
}

export interface ElasticSettlementResult {
  method: string;
  /** Oturma (mm) */
  settlement: number;
  /** Etki faktörü */
  influenceFactor: number;
  /** Rijitlik düzeltme faktörü */
  rigidityFactor: number;
}

export interface ConsolidationInput {
  /** Tabaka kalınlığı H (m) */
  thickness: number;
  /** Başlangıç boşluk oranı e0 */
  e0: number;
  /** Sıkışma indeksi Cc */
  Cc: number;
  /** Şişme indeksi Cs (recompression) */
  Cs?: number;
  /** Mevcut efektif gerilme σ'0 (kPa) */
  sigma0: number;
  /** Gerilme artışı Δσ (kPa) */
  deltaSigma: number;
  /** Ön konsolidasyon basıncı σ'p (kPa) — NC zemin için σ'0 ile aynı */
  preconsolidationPressure?: number;
  /** Konsolidasyon katsayısı Cv (m²/yıl) — zaman hesabı için */
  cv?: number;
  /** Drenaj koşulu */
  drainage?: "single" | "double";
}

export interface ConsolidationResult {
  method: string;
  /** Birincil konsolidasyon oturması (mm) */
  primarySettlement: number;
  /** Zemin durumu */
  soilState: "NC" | "OC-case1" | "OC-case2";
  /** Zaman-oturma tablosu (varsa) */
  timeSettlement?: { timeDays: number[]; degree: number[]; settlement: number[] };
}

export interface SchmertmannInput {
  /** Temel genişliği B (m) */
  width: number;
  /** Temel uzunluğu L (m) */
  length?: number;
  /** Net taban basıncı q (kPa) */
  pressure: number;
  /** Temel derinliği Df (m) */
  depth: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Tabaka bilgileri: derinlik (m) ve Es (kPa) */
  layers: { depthTop: number; depthBottom: number; Es: number }[];
  /** Zaman (yıl) — creep düzeltmesi için */
  timeYears?: number;
}

export interface SchmertmannResult {
  method: string;
  settlement: number;
  C1: number;
  C2: number;
  layerContributions: { depth: number; Iz: number; Es: number; contribution: number }[];
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ─── Elastik Oturma (Boussinesq) ───

export function elasticSettlement(input: ElasticSettlementInput): ElasticSettlementResult {
  const { width: B, length: L, pressure: q, elasticModulus: Es, poissonRatio: nu = 0.3, rigidity = "flexible" } = input;

  const BL = L && L > 0 ? L / B : 1;

  // Steinbrenner influence factor (corner)
  let If: number;
  if (BL <= 1) If = 0.56;
  else if (BL <= 1.5) If = 0.68;
  else if (BL <= 2) If = 0.77;
  else if (BL <= 3) If = 0.89;
  else if (BL <= 5) If = 1.05;
  else if (BL <= 10) If = 1.26;
  else If = 1.4;

  // Center of flexible footing = 4 * corner
  // Average flexible ≈ 0.85 * center
  const rigidityFactor = rigidity === "rigid" ? 0.82 : 1.0;

  // Se = q * B * (1 - ν²) * If * rigidityFactor / Es
  const settlement = (q * B * (1 - nu * nu) * If * rigidityFactor) / Es * 1000; // mm

  return {
    method: "Elastik (Boussinesq-Steinbrenner)",
    settlement: round(settlement),
    influenceFactor: round(If, 3),
    rigidityFactor: round(rigidityFactor, 3),
  };
}

// ─── 1D Konsolidasyon ───

export function consolidationSettlement(input: ConsolidationInput): ConsolidationResult {
  const { thickness: H, e0, Cc, Cs = Cc / 5, sigma0, deltaSigma, preconsolidationPressure: sigmaP, cv, drainage = "double" } = input;

  const pc = sigmaP ?? sigma0; // NC if not specified
  const sigmaFinal = sigma0 + deltaSigma;

  let settlement: number;
  let soilState: "NC" | "OC-case1" | "OC-case2";

  if (sigma0 >= pc) {
    // Normally consolidated
    soilState = "NC";
    settlement = (Cc * H / (1 + e0)) * Math.log10(sigmaFinal / sigma0);
  } else if (sigmaFinal <= pc) {
    // Overconsolidated — stays in recompression
    soilState = "OC-case1";
    settlement = (Cs * H / (1 + e0)) * Math.log10(sigmaFinal / sigma0);
  } else {
    // OC but goes past preconsolidation
    soilState = "OC-case2";
    const s1 = (Cs * H / (1 + e0)) * Math.log10(pc / sigma0);
    const s2 = (Cc * H / (1 + e0)) * Math.log10(sigmaFinal / pc);
    settlement = s1 + s2;
  }

  const primarySettlement = round(settlement * 1000); // mm

  // Time-settlement if Cv provided
  let timeSettlement: ConsolidationResult["timeSettlement"];
  if (cv && cv > 0) {
    const Hdr = drainage === "double" ? H / 2 : H;
    const timeDays: number[] = [];
    const degree: number[] = [];
    const settlementArr: number[] = [];

    const targetU = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99];
    for (const U of targetU) {
      let Tv: number;
      if (U <= 0) { Tv = 0; }
      else if (U < 0.6) { Tv = (Math.PI / 4) * U * U; }
      else { Tv = -0.9332 * Math.log10(1 - U) - 0.0851; }

      const t = (Tv * Hdr * Hdr) / cv; // years
      timeDays.push(round(t * 365, 0));
      degree.push(round(U * 100, 1));
      settlementArr.push(round(U * primarySettlement, 1));
    }
    timeSettlement = { timeDays, degree, settlement: settlementArr };
  }

  return {
    method: "1D Konsolidasyon (Terzaghi)",
    primarySettlement,
    soilState,
    timeSettlement,
  };
}

// ─── Schmertmann (CPT bazlı) ───

export function schmertmannSettlement(input: SchmertmannInput): SchmertmannResult {
  const { width: B, length: L, pressure: q, depth: Df, gamma, layers, timeYears = 1 } = input;

  const BL = L && L > 0 ? L / B : 1;
  const isSquare = BL <= 1.2;
  const zMax = isSquare ? 2 * B : 4 * B; // influence depth

  // C1 — depth correction
  const q0 = gamma * Df;
  const deltaQ = q - q0;
  const C1 = Math.max(0.5, 1 - 0.5 * (q0 / Math.max(deltaQ, 0.1)));

  // C2 — creep correction
  const C2 = 1 + 0.2 * Math.log10(Math.max(timeYears, 0.1) / 0.1);

  // Strain influence factor Iz
  const zPeak = isSquare ? 0.5 * B : B;
  const IzPeak = isSquare ? 0.6 : 0.6; // simplified

  function getIz(z: number): number {
    if (z <= 0) return isSquare ? 0.1 : 0.2;
    if (z <= zPeak) {
      const Iz0 = isSquare ? 0.1 : 0.2;
      return Iz0 + (IzPeak - Iz0) * (z / zPeak);
    }
    if (z >= zMax) return 0;
    return IzPeak * (1 - (z - zPeak) / (zMax - zPeak));
  }

  let totalSettlement = 0;
  const contributions: SchmertmannResult["layerContributions"] = [];

  for (const layer of layers) {
    const zt = Math.max(layer.depthTop, 0);
    const zb = Math.min(layer.depthBottom, zMax);
    if (zb <= zt) continue;

    const zMid = (zt + zb) / 2;
    const dz = zb - zt;
    const Iz = getIz(zMid);
    const contribution = (Iz / layer.Es) * dz;
    totalSettlement += contribution;

    contributions.push({
      depth: round(zMid),
      Iz: round(Iz, 3),
      Es: layer.Es,
      contribution: round(contribution * 1000, 3),
    });
  }

  const settlement = round(C1 * C2 * deltaQ * totalSettlement * 1000); // mm

  return {
    method: "Schmertmann (1978)",
    settlement,
    C1: round(C1, 3),
    C2: round(C2, 3),
    layerContributions: contributions,
  };
}
