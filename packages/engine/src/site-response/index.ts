/**
 * GeoForce Engine — Basitleştirilmiş Saha Tepki Analizi
 * Vs30 hesabı, zemin büyütme faktörleri, eşdeğer lineer yöntem
 */

export interface SiteResponseInput {
  /** Tabaka bilgileri (üstten alta) */
  layers: SiteResponseLayer[];
  /** Kaya seviyesindeki PGA (g) */
  rockPGA: number;
  /** Deprem büyüklüğü Mw */
  magnitude?: number;
}

export interface SiteResponseLayer {
  /** Tabaka kalınlığı (m) */
  thickness: number;
  /** Kayma dalgası hızı Vs (m/s) */
  vs: number;
  /** Birim hacim ağırlık γ (kN/m³) */
  gamma: number;
  /** Sönüm oranı D (%) — varsayılan 5 */
  damping?: number;
}

export interface SiteResponseResult {
  /** Vs30 (m/s) */
  vs30: number;
  /** TBDY 2018 zemin sınıfı */
  soilClass: string;
  /** Yüzey PGA (g) */
  surfacePGA: number;
  /** Büyütme faktörü */
  amplificationFactor: number;
  /** Doğal periyot T0 (s) */
  naturalPeriod: number;
  /** Tabaka detayları */
  layerDetails: { depth: number; vs: number; travelTime: number; impedance: number }[];
  /** Basitleştirilmiş transfer fonksiyonu */
  transferFunction: { frequency: number; amplification: number }[];
}

export interface Vs30Result {
  /** Vs30 (m/s) */
  vs30: number;
  /** TBDY 2018 zemin sınıfı */
  soilClass: string;
  soilClassTR: string;
  /** Toplam kalınlık (m) */
  totalThickness: number;
  /** Toplam seyahat süresi (s) */
  totalTravelTime: number;
  /** Tabaka detayları */
  layers: { depth: number; thickness: number; vs: number; travelTime: number }[];
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ─── Vs30 Hesabı ───

export function calculateVs30(layers: { thickness: number; vs: number }[]): Vs30Result {
  let totalThickness = 0;
  let totalTravelTime = 0;
  const details: Vs30Result["layers"] = [];
  let depth = 0;

  for (const layer of layers) {
    if (totalThickness >= 30) break;
    const effectiveThickness = Math.min(layer.thickness, 30 - totalThickness);
    const tt = effectiveThickness / layer.vs;
    totalTravelTime += tt;
    totalThickness += effectiveThickness;

    details.push({
      depth: round(depth),
      thickness: round(effectiveThickness),
      vs: layer.vs,
      travelTime: round(tt, 4),
    });
    depth += effectiveThickness;
  }

  // Eğer 30m'ye ulaşılamadıysa, son tabakanın Vs'i ile tamamla
  if (totalThickness < 30 && layers.length > 0) {
    const remaining = 30 - totalThickness;
    const lastVs = layers[layers.length - 1].vs;
    totalTravelTime += remaining / lastVs;
    totalThickness = 30;
    details.push({
      depth: round(depth),
      thickness: round(remaining),
      vs: lastVs,
      travelTime: round(remaining / lastVs, 4),
    });
  }

  const vs30 = totalTravelTime > 0 ? round(30 / totalTravelTime) : 0;

  let soilClass: string;
  let soilClassTR: string;
  if (vs30 > 1500) { soilClass = "ZA"; soilClassTR = "Sağlam Kaya"; }
  else if (vs30 > 760) { soilClass = "ZB"; soilClassTR = "Kaya"; }
  else if (vs30 > 360) { soilClass = "ZC"; soilClassTR = "Sıkı Zemin"; }
  else if (vs30 > 180) { soilClass = "ZD"; soilClassTR = "Orta Sıkı Zemin"; }
  else { soilClass = "ZE"; soilClassTR = "Yumuşak Zemin"; }

  return { vs30, soilClass, soilClassTR, totalThickness: round(totalThickness), totalTravelTime: round(totalTravelTime, 4), layers: details };
}

// ─── Basitleştirilmiş Saha Tepki ───

export function siteResponseAnalysis(input: SiteResponseInput): SiteResponseResult {
  const { layers, rockPGA } = input;

  // Vs30
  const vs30Result = calculateVs30(layers);

  // Doğal periyot T0 = 4H / Vs (quarter wavelength)
  let totalH = 0;
  let weightedVs = 0;
  for (const l of layers) {
    totalH += l.thickness;
    weightedVs += l.thickness * l.vs;
  }
  const avgVs = totalH > 0 ? weightedVs / totalH : 200;
  const T0 = totalH > 0 ? (4 * totalH) / avgVs : 0.5;

  // Impedance contrast amplification
  const layerDetails: SiteResponseResult["layerDetails"] = [];
  let depth = 0;
  let totalTravelTime = 0;

  for (const l of layers) {
    const tt = l.thickness / l.vs;
    totalTravelTime += tt;
    const impedance = l.gamma * l.vs; // kN·s/m³
    layerDetails.push({
      depth: round(depth),
      vs: l.vs,
      travelTime: round(tt, 4),
      impedance: round(impedance),
    });
    depth += l.thickness;
  }

  // Basitleştirilmiş büyütme — Midorikawa (1987) yaklaşımı
  // AF ≈ (ρrock * Vsrock / ρsoil * Vssoil)^0.5
  const rockVs = layers.length > 0 ? Math.max(...layers.map(l => l.vs), 760) : 760;
  const rockGamma = 25; // kN/m³ kaya
  const surfaceVs = layers.length > 0 ? layers[0].vs : 200;
  const surfaceGamma = layers.length > 0 ? layers[0].gamma : 18;

  const impedanceRatio = (rockGamma * rockVs) / (surfaceGamma * surfaceVs);
  let AF = Math.pow(impedanceRatio, 0.5);
  AF = Math.min(AF, 5); // üst sınır

  // Nonlineer düzeltme (Idriss, 1990 yaklaşımı)
  if (rockPGA > 0.1) {
    const nlFactor = 1 - 0.5 * Math.log10(rockPGA / 0.1);
    AF *= Math.max(nlFactor, 0.5);
  }

  const surfacePGA = round(rockPGA * AF, 4);

  // Basitleştirilmiş transfer fonksiyonu
  const f0 = 1 / T0; // temel frekans
  const transferFunction: SiteResponseResult["transferFunction"] = [];
  for (let f = 0.1; f <= 20; f += 0.2) {
    const ratio = f / f0;
    // SH dalga rezonans yaklaşımı
    const D = 0.05; // %5 sönüm
    const amp = 1 / Math.sqrt(Math.pow(Math.cos(Math.PI * ratio / 2), 2) + Math.pow(D * Math.PI * ratio, 2));
    const totalAmp = Math.min(amp * Math.sqrt(impedanceRatio), 10);
    transferFunction.push({ frequency: round(f, 1), amplification: round(totalAmp, 2) });
  }

  return {
    vs30: vs30Result.vs30,
    soilClass: vs30Result.soilClass,
    surfacePGA,
    amplificationFactor: round(AF, 3),
    naturalPeriod: round(T0, 3),
    layerDetails,
    transferFunction,
  };
}
