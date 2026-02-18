/**
 * GeoForce Engine — Zemin İyileştirme
 * Dinamik kompaksiyon, jet grout, taş kolon, ön yükleme
 */

export interface DynamicCompactionInput {
  /** Tokmak ağırlığı W (ton) */
  weight: number;
  /** Düşme yüksekliği h (m) */
  dropHeight: number;
  /** Hedef iyileştirme derinliği (m) */
  targetDepth?: number;
  /** Zemin tipi */
  soilType: "granular" | "cohesive" | "mixed";
}

export interface DynamicCompactionResult {
  method: string;
  /** Etki derinliği D (m) — Menard formülü */
  effectiveDepth: number;
  /** Enerji (ton·m) */
  energy: number;
  /** n katsayısı (zemin tipine göre) */
  nCoefficient: number;
  /** Önerilen grid aralığı (m) */
  suggestedSpacing: number;
  /** Pas sayısı önerisi */
  suggestedPasses: number;
}

export interface StoneColumnInput {
  /** Kolon çapı d (m) */
  diameter: number;
  /** Kolon aralığı s (m) */
  spacing: number;
  /** Kolon düzeni */
  pattern: "square" | "triangular";
  /** Kolon sürtünme açısı φc (°) */
  columnFrictionAngle: number;
  /** Zemin drenajsız kayma dayanımı cu (kPa) */
  soilCu: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  soilGamma: number;
  /** Yükleme basıncı q (kPa) */
  appliedStress: number;
  /** Kolon uzunluğu L (m) */
  length: number;
}

export interface StoneColumnResult {
  method: string;
  /** Alan iyileştirme oranı ar */
  areaRatio: number;
  /** Gerilme konsantrasyon oranı n */
  stressConcentrationRatio: number;
  /** Oturma azaltma faktörü β */
  settlementReductionFactor: number;
  /** Kolon taşıma kapasitesi (kPa) */
  columnCapacity: number;
  /** Grup taşıma kapasitesi (kPa) */
  groupCapacity: number;
  /** İyileştirilmiş zemin modülü (kPa) */
  improvedModulus: number;
}

export interface PreloadingInput {
  /** Hedef konsolidasyon oturması Sc (m) */
  targetSettlement: number;
  /** Konsolidasyon katsayısı Cv (m²/yıl) */
  cv: number;
  /** Drenaj yolu Hdr (m) */
  drainagePath: number;
  /** Mevcut efektif gerilme σ'0 (kPa) */
  effectiveStress: number;
  /** Sıkışma indisi Cc */
  Cc: number;
  /** Tabaka kalınlığı H (m) */
  layerThickness: number;
  /** Boşluk oranı e0 */
  e0: number;
  /** Hedef süre (yıl) */
  targetTime: number;
}

export interface PreloadingResult {
  method: string;
  /** Gerekli ön yükleme basıncı Δσ (kPa) */
  requiredPreload: number;
  /** Ön yükleme yüksekliği (m) — γfill=18 kN/m³ varsayımı */
  fillHeight: number;
  /** Hedef sürede konsolidasyon derecesi U (%) */
  degreeAtTargetTime: number;
  /** %90 konsolidasyon süresi (yıl) */
  time90: number;
  /** Artık oturma (m) */
  residualSettlement: number;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const toRad = (d: number) => (d * Math.PI) / 180;

function UtoTv(U: number): number {
  const u = U / 100;
  if (u < 0.526) return (Math.PI / 4) * u * u;
  return -0.933 * Math.log10(1 - u) - 0.085;
}
function TvToU(Tv: number): number {
  let U = 50;
  for (let i = 0; i < 50; i++) {
    const tv = UtoTv(U);
    const diff = tv - Tv;
    if (Math.abs(diff) < 0.0001) break;
    const tvPlus = UtoTv(U + 0.1);
    const dTv = (tvPlus - tv) / 0.1;
    if (Math.abs(dTv) < 1e-10) break;
    U -= diff / dTv;
    U = Math.max(0.1, Math.min(99.9, U));
  }
  return round(U, 1);
}

export function dynamicCompaction(input: DynamicCompactionInput): DynamicCompactionResult {
  const { weight, dropHeight, soilType } = input;
  const energy = weight * dropHeight;

  // Menard formülü: D = n × √(W×h)
  const nMap: Record<string, number> = { granular: 0.5, mixed: 0.4, cohesive: 0.35 };
  const n = nMap[soilType];
  const D = n * Math.sqrt(energy);

  const spacing = round(D * 0.8); // grid aralığı ≈ 0.8D
  const passes = soilType === "granular" ? 3 : soilType === "mixed" ? 4 : 5;

  return {
    method: "Menard Dinamik Kompaksiyon",
    effectiveDepth: round(D, 1),
    energy: round(energy),
    nCoefficient: n,
    suggestedSpacing: spacing,
    suggestedPasses: passes,
  };
}

export function stoneColumn(input: StoneColumnInput): StoneColumnResult {
  const { diameter, spacing, pattern, columnFrictionAngle, soilCu, soilGamma, appliedStress, length } = input;

  // Alan iyileştirme oranı
  const Ac = (Math.PI / 4) * diameter * diameter;
  const De = pattern === "square" ? 1.128 * spacing : 1.05 * spacing;
  const Ae = (Math.PI / 4) * De * De;
  const ar = Ac / Ae;

  // Gerilme konsantrasyon oranı (Priebe, 1995)
  const phiRad = toRad(columnFrictionAngle);
  const Kp = Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
  const n_stress = (1 + ar * (Kp - 1)) / (1 - ar * (1 - 1 / Kp));

  // Oturma azaltma faktörü
  const beta = 1 / (1 + ar * (n_stress - 1));

  // Kolon taşıma kapasitesi — Vesic cavity expansion
  const sigma_r = 4 * soilCu + soilGamma * length / 2 * 0.5; // radyal gerilme yaklaşımı
  const qc = sigma_r * Kp;

  // Grup kapasitesi
  const qGroup = ar * qc + (1 - ar) * (soilCu * 5); // kolon + zemin katkısı

  // İyileştirilmiş modül
  const Es_soil = 250 * soilCu; // yaklaşık
  const Es_column = 50000; // kPa, taş kolon
  const E_improved = ar * Es_column + (1 - ar) * Es_soil;

  return {
    method: "Priebe (1995) Taş Kolon",
    areaRatio: round(ar, 4),
    stressConcentrationRatio: round(n_stress, 2),
    settlementReductionFactor: round(beta, 3),
    columnCapacity: round(qc),
    groupCapacity: round(qGroup),
    improvedModulus: round(E_improved),
  };
}

export function preloading(input: PreloadingInput): PreloadingResult {
  const { targetSettlement, cv, drainagePath, effectiveStress, Cc, layerThickness, e0, targetTime } = input;

  // Gerekli ön yükleme: Sc = Cc * H / (1+e0) * log10((σ'0 + Δσ) / σ'0)
  // Δσ = σ'0 * (10^(Sc*(1+e0)/(Cc*H)) - 1)
  const exponent = (targetSettlement * (1 + e0)) / (Cc * layerThickness);
  const requiredPreload = effectiveStress * (Math.pow(10, exponent) - 1);

  const gammaFill = 18; // kN/m³
  const fillHeight = requiredPreload / gammaFill;

  // Hedef sürede konsolidasyon derecesi
  const Tv = (cv * targetTime) / (drainagePath * drainagePath);
  const U = TvToU(Tv);

  // %90 konsolidasyon süresi
  const Tv90 = UtoTv(90);
  const time90 = (Tv90 * drainagePath * drainagePath) / cv;

  // Artık oturma
  const residual = targetSettlement * (1 - U / 100);

  return {
    method: "Ön Yükleme (Preloading)",
    requiredPreload: round(requiredPreload),
    fillHeight: round(fillHeight, 2),
    degreeAtTargetTime: U,
    time90: round(time90, 2),
    residualSettlement: round(residual, 4),
  };
}
