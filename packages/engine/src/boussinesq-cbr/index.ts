/**
 * GeoForce Engine — Boussinesq Gerilme Dağılımı & CBR Korelasyonları
 */

// ─── Boussinesq ───

export interface BoussinesqPointInput {
  /** Nokta yük Q (kN) */
  load: number;
  /** Derinlik z (m) */
  depth: number;
  /** Yatay mesafe r (m) */
  radialDistance: number;
}

export interface BoussinesqRectInput {
  /** Üniform basınç q (kPa) */
  pressure: number;
  /** Temel genişliği B (m) */
  B: number;
  /** Temel uzunluğu L (m) */
  L: number;
  /** Derinlik z (m) */
  depth: number;
}

export interface BoussinesqResult {
  method: string;
  /** Düşey gerilme artışı Δσz (kPa) */
  deltaStress: number;
  /** Etki katsayısı I */
  influenceFactor: number;
}

export function boussinesqPoint(input: BoussinesqPointInput): BoussinesqResult {
  const { load: Q, depth: z, radialDistance: r } = input;
  if (z <= 0) return { method: "Boussinesq Nokta Yük", deltaStress: 0, influenceFactor: 0 };

  const R = Math.sqrt(r * r + z * z);
  const I = (3 / (2 * Math.PI)) * Math.pow(z, 3) / Math.pow(R, 5);
  const deltaSigma = Q * I;

  return { method: "Boussinesq Nokta Yük", deltaStress: rd(deltaSigma), influenceFactor: rd(I, 6) };
}

export function boussinesqRect(input: BoussinesqRectInput): BoussinesqResult {
  const { pressure: q, B, L, depth: z } = input;
  if (z <= 0) return { method: "Boussinesq Dikdörtgen Yük (Newmark)", deltaStress: q, influenceFactor: 1 };

  // Newmark formülü — köşe altı, 4 köşe toplamı (merkez altı)
  const m = B / (2 * z);
  const n = L / (2 * z);

  const mn2 = m * m + n * n;
  const mnp = m * m * n * n;
  const denom = mn2 + 1;

  const term1 = (2 * m * n * Math.sqrt(mn2 + 1)) / (mn2 + mnp + 1);
  const term2 = mn2 + 1;

  let I: number;
  if (term1 > 1) {
    I = (1 / (4 * Math.PI)) * (term1 / term2 + Math.atan(term1));
  } else {
    I = (1 / (4 * Math.PI)) * ((2 * m * n * Math.sqrt(denom)) / (denom + mnp) * (denom + mnp > 0 ? 1 : 0) + Math.atan2(2 * m * n * Math.sqrt(denom), denom - mnp));
  }

  // Merkez altı = 4 × köşe
  const Icenter = 4 * Math.max(I, 0);
  const deltaSigma = q * Icenter;

  return { method: "Boussinesq Dikdörtgen (Newmark)", deltaStress: rd(deltaSigma), influenceFactor: rd(Icenter, 4) };
}

/** Derinlik profili — gerilme dağılımı */
export function boussinesqProfile(input: Omit<BoussinesqRectInput, "depth"> & { maxDepth?: number }): { depth: number; deltaStress: number; ratio: number }[] {
  const { pressure: q, B, L, maxDepth } = input;
  const zMax = maxDepth ?? B * 4;
  const profile: { depth: number; deltaStress: number; ratio: number }[] = [];

  for (let i = 0; i <= 30; i++) {
    const z = (i / 30) * zMax;
    if (z === 0) {
      profile.push({ depth: 0, deltaStress: rd(q), ratio: 1 });
      continue;
    }
    const r = boussinesqRect({ pressure: q, B, L, depth: z });
    profile.push({ depth: rd(z, 2), deltaStress: r.deltaStress, ratio: rd(r.deltaStress / q, 4) });
  }
  return profile;
}

// ─── CBR Korelasyonları ───

export interface CBRInput {
  /** CBR değeri (%) */
  cbr: number;
}

export interface CBRResult {
  /** CBR (%) */
  cbr: number;
  /** Yatak katsayısı k (MN/m³) — AASHTO yaklaşımı */
  subgradeModulus: number;
  /** Elastisite modülü Mr (MPa) — AASHTO 1993 */
  resilientModulus: number;
  /** İzin verilebilir taşıma kapasitesi (kPa) — yaklaşık */
  approxBearing: number;
  /** Zemin sınıfı tanımı */
  soilQuality: string;
  /** Yol üstyapı kalınlığı önerisi (cm) — basitleştirilmiş */
  pavementThickness: number;
}

export function cbrCorrelations(input: CBRInput): CBRResult {
  const { cbr } = input;

  // Mr = 10.3 × CBR (MPa) — AASHTO 1993
  const Mr = rd(10.3 * cbr, 1);

  // k ≈ Mr / 0.3048 × 0.0254 (yaklaşık dönüşüm)
  // Basitleştirilmiş: k = 5.4 × CBR^0.64 (MN/m³)
  const k = rd(5.4 * Math.pow(cbr, 0.64), 1);

  // Yaklaşık taşıma kapasitesi
  const qa = rd(cbr * 10);

  // Zemin kalitesi
  let soilQuality: string;
  if (cbr < 3) soilQuality = "Çok zayıf (OH, CH, MH)";
  else if (cbr < 7) soilQuality = "Zayıf (CL, ML)";
  else if (cbr < 20) soilQuality = "Orta (SC, SM, SP)";
  else if (cbr < 50) soilQuality = "İyi (GW, GP, SW)";
  else soilQuality = "Çok iyi (Kaya, stabilize)";

  // Basitleştirilmiş üstyapı kalınlığı (cm)
  // T ≈ 60 / CBR^0.5 (ampirik)
  const thickness = rd(Math.max(60 / Math.sqrt(cbr), 15), 0);

  return { cbr, subgradeModulus: k, resilientModulus: Mr, approxBearing: qa, soilQuality, pavementThickness: thickness };
}

function rd(v: number, d = 2) { return Math.round(v * 10 ** d) / 10 ** d; }
