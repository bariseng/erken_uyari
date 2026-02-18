/**
 * GeoForce Engine — Efektif Gerilme Profili & SPT/CPT Korelasyonları & Sızma
 */

// ─── Efektif Gerilme ───

export interface StressLayer {
  /** Tabaka kalınlığı (m) */
  thickness: number;
  /** Birim hacim ağırlık γ (kN/m³) */
  gamma: number;
  /** Doygun birim hacim ağırlık γsat (kN/m³) — su altı için */
  gammaSat?: number;
}

export interface StressProfileInput {
  layers: StressLayer[];
  /** Yeraltı su seviyesi derinliği (m) */
  waterTableDepth: number;
  /** Sürşarj q (kPa) */
  surcharge?: number;
}

export interface StressProfileResult {
  /** Derinlik-gerilme noktaları */
  profile: { depth: number; totalStress: number; porePressure: number; effectiveStress: number; layerIndex: number }[];
}

export function stressProfile(input: StressProfileInput): StressProfileResult {
  const { layers, waterTableDepth, surcharge = 0 } = input;
  const gammaW = 9.81;
  const profile: StressProfileResult["profile"] = [];
  let depth = 0;
  let sigma = surcharge;
  let u = 0;

  profile.push({ depth: 0, totalStress: r(sigma), porePressure: 0, effectiveStress: r(sigma), layerIndex: 0 });

  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const steps = Math.max(2, Math.ceil(l.thickness / 0.5));
    const dz = l.thickness / steps;

    for (let j = 1; j <= steps; j++) {
      const z = depth + j * dz;
      const isSubmerged = z > waterTableDepth;
      const gamma = isSubmerged ? (l.gammaSat ?? l.gamma) : l.gamma;
      sigma += gamma * dz;
      u = isSubmerged ? gammaW * (z - waterTableDepth) : 0;
      profile.push({ depth: r(z, 2), totalStress: r(sigma), porePressure: r(u), effectiveStress: r(sigma - u), layerIndex: i });
    }
    depth += l.thickness;
  }

  return { profile };
}

// ─── SPT Korelasyonları ───

export interface SPTInput {
  /** Ham SPT N değeri */
  N: number;
  /** Derinlik (m) */
  depth: number;
  /** Efektif düşey gerilme σ'v (kPa) */
  effectiveStress: number;
  /** Çekiç enerji oranı (%) — varsayılan 60 */
  energyRatio?: number;
  /** Sondaj çapı düzeltmesi CB — varsayılan 1 */
  CB?: number;
  /** Numune alıcı düzeltmesi CS — varsayılan 1 */
  CS?: number;
  /** Kuyu boyu düzeltmesi CR — varsayılan 1 (derinliğe göre otomatik) */
  CR?: number;
  /** Zemin tipi */
  soilType: "sand" | "clay";
}

export interface SPTResult {
  /** Düzeltilmiş N60 */
  N60: number;
  /** Normalize edilmiş (N1)60 */
  N1_60: number;
  /** Gerilme düzeltme katsayısı CN */
  CN: number;
  /** Bağıl sıkılık Dr (%) — kum */
  relativeDensity?: number;
  /** İçsel sürtünme açısı φ (°) — kum */
  frictionAngle?: number;
  /** Drenajsız kayma dayanımı cu (kPa) — kil */
  cu?: number;
  /** Elastisite modülü Es (kPa) */
  elasticModulus: number;
  /** Kıvam — kil */
  consistency?: string;
  /** Sıkılık — kum */
  density?: string;
}

export function sptCorrelations(input: SPTInput): SPTResult {
  const { N, depth, effectiveStress, soilType, energyRatio = 60, CB = 1, CS = 1 } = input;

  // Rod length correction
  let CR = input.CR ?? 1;
  if (!input.CR) {
    if (depth < 3) CR = 0.75;
    else if (depth < 4) CR = 0.8;
    else if (depth < 6) CR = 0.85;
    else if (depth < 10) CR = 0.95;
    else CR = 1.0;
  }

  const CE = energyRatio / 60;
  const N60 = r(N * CE * CB * CS * CR);

  // Overburden correction (Liao & Whitman, 1986)
  const Pa = 100; // kPa
  const CN = Math.min(effectiveStress > 0 ? Math.sqrt(Pa / effectiveStress) : 1, 1.7);
  const N1_60 = r(N60 * CN);

  let relativeDensity: number | undefined;
  let frictionAngle: number | undefined;
  let cu: number | undefined;
  let elasticModulus: number;
  let consistency: string | undefined;
  let density: string | undefined;

  if (soilType === "sand") {
    // Bağıl sıkılık (Skempton, 1986)
    relativeDensity = r(Math.min(Math.sqrt(N1_60 / 46) * 100, 100));

    // Sürtünme açısı (Hatanaka & Uchida, 1996)
    frictionAngle = r(Math.sqrt(20 * N1_60) + 20, 1);
    frictionAngle = Math.min(frictionAngle, 50);

    // Elastisite modülü (Webb, 1969)
    elasticModulus = r(500 * (N60 + 15));

    // Sıkılık tanımı
    if (N60 <= 4) density = "Çok gevşek";
    else if (N60 <= 10) density = "Gevşek";
    else if (N60 <= 30) density = "Orta sıkı";
    else if (N60 <= 50) density = "Sıkı";
    else density = "Çok sıkı";
  } else {
    // Kil — cu (Stroud, 1974)
    cu = r(N60 * 4.5);

    // Elastisite modülü
    elasticModulus = r(600 * N60);

    // Kıvam
    if (N60 <= 2) consistency = "Çok yumuşak";
    else if (N60 <= 4) consistency = "Yumuşak";
    else if (N60 <= 8) consistency = "Orta katı";
    else if (N60 <= 15) consistency = "Katı";
    else if (N60 <= 30) consistency = "Çok katı";
    else consistency = "Sert";
  }

  return { N60, N1_60, CN: r(CN, 3), relativeDensity, frictionAngle, cu, elasticModulus, consistency, density };
}

// ─── Sızma (Darcy) ───

export interface SeepageInput {
  /** Permeabilite katsayısı k (m/s) */
  permeability: number;
  /** Hidrolik eğim i = Δh/L */
  hydraulicGradient: number;
  /** Kesit alanı A (m²) */
  area: number;
}

export interface SeepageResult {
  /** Debi Q (m³/s) */
  flowRate: number;
  /** Debi (L/dk) */
  flowRateLpm: number;
  /** Darcy hızı v (m/s) */
  darcyVelocity: number;
  /** Kritik hidrolik eğim ic (kabarma) — Gs verilirse */
  criticalGradient?: number;
  /** Güvenlik katsayısı (kabarma) */
  FS_heave?: number;
}

export function darcySeepage(input: SeepageInput & { Gs?: number; voidRatio?: number }): SeepageResult {
  const { permeability: k, hydraulicGradient: i, area: A, Gs = 2.65, voidRatio: e = 0.7 } = input;

  const v = k * i; // Darcy hızı
  const Q = v * A;
  const Qlpm = Q * 1000 * 60;

  // Kritik hidrolik eğim (kabarma)
  const ic = (Gs - 1) / (1 + e);
  const FS = i > 0 ? ic / i : 99;

  return {
    flowRate: r(Q, 6),
    flowRateLpm: r(Qlpm, 4),
    darcyVelocity: r(v, 6),
    criticalGradient: r(ic, 3),
    FS_heave: r(FS, 2),
  };
}

function r(v: number, d = 2) { return Math.round(v * 10 ** d) / 10 ** d; }
