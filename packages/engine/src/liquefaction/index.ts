/**
 * GeoForce Engine — Sıvılaşma Değerlendirmesi
 * TBDY 2018 Bölüm 16.6, Boulanger & Idriss (2014)
 */

export interface LiquefactionInput {
  /** Tabaka bilgileri */
  layers: LiquefactionLayer[];
  /** Deprem büyüklüğü Mw */
  magnitude: number;
  /** Maksimum yer ivmesi amax (g) */
  amax: number;
  /** Yeraltı su seviyesi derinliği (m) */
  waterTableDepth: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) — ortalama */
  gamma?: number;
  /** Doygun birim hacim ağırlık γsat (kN/m³) */
  gammaSat?: number;
}

export interface LiquefactionLayer {
  /** Tabaka orta derinliği (m) */
  depth: number;
  /** SPT N değeri (ham) */
  N?: number;
  /** Enerji düzeltme oranı CE — varsayılan 1.0 */
  CE?: number;
  /** Çap düzeltmesi CB — varsayılan 1.0 */
  CB?: number;
  /** Numune alıcı düzeltmesi CS — varsayılan 1.0 */
  CS?: number;
  /** Rod uzunluk düzeltmesi CR — varsayılan otomatik */
  CR?: number;
  /** İnce dane oranı FC (%) */
  finesContent?: number;
  /** CPT uç direnci qc (MPa) — CPT bazlı analiz için */
  qc?: number;
  /** CPT sleeve friction fs (kPa) */
  fs?: number;
}

export interface LiquefactionLayerResult {
  depth: number;
  /** Düzeltilmiş SPT değeri (N1)60cs */
  N160cs?: number;
  /** Çevrimsel gerilme oranı CSR */
  CSR: number;
  /** Çevrimsel direnç oranı CRR */
  CRR: number;
  /** Büyüklük ölçekleme faktörü MSF */
  MSF: number;
  /** Güvenlik katsayısı FS = CRR * MSF / CSR */
  FS: number;
  /** Sıvılaşma durumu */
  status: "safe" | "marginal" | "liquefiable";
  /** Toplam düşey gerilme σv (kPa) */
  sigmaV: number;
  /** Efektif düşey gerilme σ'v (kPa) */
  sigmaVeff: number;
  /** rd — gerilme azaltma katsayısı */
  rd: number;
}

export interface LiquefactionResult {
  method: string;
  layers: LiquefactionLayerResult[];
  /** Sıvılaşma Potansiyel İndeksi (LPI) — Iwasaki et al. */
  LPI: number;
  /** LPI risk seviyesi */
  riskLevel: "low" | "moderate" | "high" | "very_high";
  riskLevelTR: string;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// Gerilme azaltma katsayısı rd (Liao & Whitman, 1986 — TBDY 2018)
function calcRd(z: number): number {
  if (z <= 9.15) return 1.0 - 0.00765 * z;
  if (z <= 23) return 1.174 - 0.0267 * z;
  return 0.5; // >23m — basitleştirilmiş
}

// Rod uzunluk düzeltmesi CR
function calcCR(depth: number): number {
  if (depth < 3) return 0.75;
  if (depth < 4) return 0.8;
  if (depth < 6) return 0.85;
  if (depth < 10) return 0.95;
  return 1.0;
}

// Overburden düzeltmesi CN
function calcCN(sigmaVeff: number): number {
  if (sigmaVeff <= 0) return 1;
  const cn = Math.sqrt(100 / sigmaVeff); // Pa = 100 kPa
  return Math.min(cn, 1.7);
}

// İnce dane düzeltmesi — Boulanger & Idriss (2014)
function finesCorrection(N160: number, FC: number): number {
  if (FC <= 5) return N160;
  const deltaN = Math.exp(1.63 + 9.7 / (FC + 0.01) - (15.7 / (FC + 0.01)) ** 2);
  return N160 + deltaN;
}

// CRR7.5 — Boulanger & Idriss (2014) SPT bazlı
function calcCRR75(N160cs: number): number {
  if (N160cs >= 37.5) return 2.0; // çok yoğun, sıvılaşmaz
  const term = N160cs / 14.1 + (N160cs / 126) ** 2 - (N160cs / 23.6) ** 3 + (N160cs / 25.4) ** 4;
  return Math.exp(term - 2.8);
}

// Büyüklük ölçekleme faktörü MSF — Boulanger & Idriss (2014)
function calcMSF(Mw: number): number {
  return 6.9 * Math.exp(-Mw / 4) - 0.058;
}

export function evaluateLiquefaction(input: LiquefactionInput): LiquefactionResult {
  const { layers, magnitude: Mw, amax, waterTableDepth: GWT, gamma: g = 18, gammaSat: gsat = 20 } = input;
  const MSF = Math.max(calcMSF(Mw), 0.6);

  const results: LiquefactionLayerResult[] = [];
  let LPI = 0;

  for (const layer of layers) {
    const z = layer.depth;

    // Gerilmeler
    let sigmaV: number;
    let sigmaVeff: number;
    if (z <= GWT) {
      sigmaV = g * z;
      sigmaVeff = sigmaV;
    } else {
      sigmaV = g * GWT + gsat * (z - GWT);
      sigmaVeff = g * GWT + (gsat - 9.81) * (z - GWT);
    }

    // CSR
    const rd = calcRd(z);
    const CSR = 0.65 * (sigmaV / Math.max(sigmaVeff, 1)) * amax * rd;

    let CRR: number;
    let N160cs: number | undefined;

    if (layer.N !== undefined) {
      // SPT bazlı
      const CE = layer.CE ?? 1.0;
      const CB = layer.CB ?? 1.0;
      const CS = layer.CS ?? 1.0;
      const CR = layer.CR ?? calcCR(z);
      const CN = calcCN(sigmaVeff);

      const N60 = layer.N * CE * CB * CS * CR;
      const N160 = N60 * CN;
      const FC = layer.finesContent ?? 5;
      N160cs = round(finesCorrection(N160, FC));

      CRR = calcCRR75(N160cs);
    } else {
      // Varsayılan — düşük direnç
      CRR = 0.1;
    }

    const FS = round((CRR * MSF) / Math.max(CSR, 0.001), 3);
    const status: LiquefactionLayerResult["status"] = FS >= 1.2 ? "safe" : FS >= 1.0 ? "marginal" : "liquefiable";

    // LPI katkısı (Iwasaki et al., 1982)
    if (z <= 20) {
      const F = FS < 1 ? 1 - FS : 0;
      const w = 10 - 0.5 * z;
      LPI += F * w * (layers.length > 1 ? (layers[1]?.depth - layers[0]?.depth || 1) : 1);
    }

    results.push({
      depth: z,
      N160cs,
      CSR: round(CSR, 4),
      CRR: round(CRR, 4),
      MSF: round(MSF, 3),
      FS,
      status,
      sigmaV: round(sigmaV),
      sigmaVeff: round(sigmaVeff),
      rd: round(rd, 4),
    });
  }

  LPI = round(Math.max(LPI, 0));
  let riskLevel: LiquefactionResult["riskLevel"];
  let riskLevelTR: string;
  if (LPI <= 2) { riskLevel = "low"; riskLevelTR = "Düşük"; }
  else if (LPI <= 5) { riskLevel = "moderate"; riskLevelTR = "Orta"; }
  else if (LPI <= 15) { riskLevel = "high"; riskLevelTR = "Yüksek"; }
  else { riskLevel = "very_high"; riskLevelTR = "Çok Yüksek"; }

  return {
    method: "Boulanger & Idriss (2014) — SPT Bazlı",
    layers: results,
    LPI,
    riskLevel,
    riskLevelTR,
  };
}
