/**
 * GeoForce Engine — Mohr Dairesi & Gerilme Analizi + Sığ Temel Boyutlandırma
 */

// ─── Mohr Dairesi ───

export interface MohrInput {
  /** Büyük asal gerilme σ1 (kPa) */
  sigma1: number;
  /** Küçük asal gerilme σ3 (kPa) */
  sigma3: number;
  /** Kohezyon c (kPa) — yenilme zarfı için */
  cohesion?: number;
  /** Sürtünme açısı φ (°) — yenilme zarfı için */
  frictionAngle?: number;
}

export interface MohrResult {
  /** Merkez (kPa) */
  center: number;
  /** Yarıçap (kPa) */
  radius: number;
  /** Maksimum kayma gerilmesi τmax (kPa) */
  tauMax: number;
  /** Ortalama normal gerilme p (kPa) */
  p: number;
  /** Deviatorik gerilme q (kPa) */
  q: number;
  /** Yenilme zarfı ile kesişim açısı θf (°) */
  failurePlaneAngle?: number;
  /** Yenilme zarfı üzerindeki normal gerilme σf (kPa) */
  sigmaF?: number;
  /** Yenilme zarfı üzerindeki kayma gerilmesi τf (kPa) */
  tauF?: number;
  /** Güvenlik katsayısı (yenilme zarfına göre) */
  FS?: number;
  /** Daire noktaları (çizim için) */
  circlePoints: { sigma: number; tau: number }[];
}

export function mohrCircle(input: MohrInput): MohrResult {
  const { sigma1, sigma3, cohesion: c, frictionAngle: phi } = input;

  const center = (sigma1 + sigma3) / 2;
  const radius = (sigma1 - sigma3) / 2;
  const tauMax = radius;
  const p = center;
  const q = sigma1 - sigma3;

  // Daire noktaları
  const circlePoints: MohrResult["circlePoints"] = [];
  for (let i = 0; i <= 72; i++) {
    const theta = (i / 72) * 2 * Math.PI;
    circlePoints.push({
      sigma: r(center + radius * Math.cos(theta)),
      tau: r(radius * Math.sin(theta)),
    });
  }

  let failurePlaneAngle: number | undefined;
  let sigmaF: number | undefined;
  let tauF: number | undefined;
  let FS: number | undefined;

  if (c !== undefined && phi !== undefined) {
    const phiRad = (phi * Math.PI) / 180;
    // Yenilme düzlemi açısı: θf = 45 + φ/2
    failurePlaneAngle = r(45 + phi / 2, 1);

    // Yenilme zarfı üzerindeki gerilmeler
    const thetaF = (failurePlaneAngle * Math.PI) / 180;
    sigmaF = r(center - radius * Math.cos(2 * thetaF));
    tauF = r(Math.abs(radius * Math.sin(2 * thetaF)));

    // Mohr-Coulomb yenilme zarfı: τ = c + σ·tan(φ)
    // FS = (c + σ·tan(φ)) / τ  (en kritik noktada)
    const tauAvailable = c + Math.max(sigmaF, 0) * Math.tan(phiRad);
    FS = tauF > 0 ? r(tauAvailable / tauF, 2) : 99;
  }

  return { center: r(center), radius: r(radius), tauMax: r(tauMax), p: r(p), q: r(q), failurePlaneAngle, sigmaF, tauF, FS, circlePoints };
}

// ─── Sığ Temel Boyutlandırma ───

export interface ShallowFoundationInput {
  /** Kolon yükü P (kN) */
  load: number;
  /** Moment Mx (kN·m) — kısa kenar yönü */
  momentX?: number;
  /** Moment My (kN·m) — uzun kenar yönü */
  momentY?: number;
  /** Temel derinliği Df (m) */
  depth: number;
  /** Zemin taşıma kapasitesi qa (kPa) */
  allowableBearing: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Temel tipi */
  type: "square" | "rectangular" | "circular" | "strip";
  /** Uzun kenar / kısa kenar oranı (dikdörtgen için) */
  aspectRatio?: number;
}

export interface ShallowFoundationResult {
  method: string;
  /** Gerekli temel alanı A (m²) */
  requiredArea: number;
  /** Temel boyutları B × L (m) */
  B: number;
  L: number;
  /** Net taban basıncı qnet (kPa) */
  netPressure: number;
  /** Eksantrisite ex, ey (m) */
  ex: number;
  ey: number;
  /** Taban basıncı dağılımı (kPa) */
  pressureDistribution: { qMin: number; qMax: number; qAvg: number };
  /** Tek yönlü eksantrisite kontrolü (B/6 kuralı) */
  withinKern: boolean;
  /** Güvenlik durumu */
  safe: boolean;
}

export function shallowFoundationDesign(input: ShallowFoundationInput): ShallowFoundationResult {
  const { load: P, momentX: Mx = 0, momentY: My = 0, depth: Df, allowableBearing: qa, gamma, type, aspectRatio: ar = 1.5 } = input;

  // Temel üstü dolgu ağırlığı (yaklaşık)
  const gammaC = 24; // beton
  const surchargeWeight = gamma * Df; // kPa

  // Net izin verilebilir basınç
  const qNet = qa - surchargeWeight;

  // Gerekli alan
  const Areq = P / Math.max(qNet, 1);

  let B: number, L: number;
  if (type === "square") {
    B = Math.sqrt(Areq);
    L = B;
  } else if (type === "circular") {
    B = Math.sqrt((4 * Areq) / Math.PI);
    L = B;
  } else if (type === "strip") {
    B = Areq / 10; // 10m uzunluk varsayımı
    L = 10;
  } else {
    // Dikdörtgen: L = ar * B, A = ar * B²
    B = Math.sqrt(Areq / ar);
    L = ar * B;
  }

  // Yukarı yuvarla (0.1m hassasiyet)
  B = Math.ceil(B * 10) / 10;
  L = Math.ceil(L * 10) / 10;
  if (type === "square") L = B;

  const A = B * L;

  // Eksantrisite
  const ex = P > 0 ? Math.abs(Mx) / P : 0;
  const ey = P > 0 ? Math.abs(My) / P : 0;

  // Kern kontrolü: ex ≤ B/6, ey ≤ L/6
  const withinKern = ex <= B / 6 && ey <= L / 6;

  // Taban basıncı dağılımı
  let qMin: number, qMax: number, qAvg: number;
  qAvg = P / A;

  if (withinKern) {
    // q = P/A ± 6*Mx/(B*L²) ± 6*My/(B²*L)
    const dqx = A > 0 ? (6 * Math.abs(Mx)) / (B * L * L) : 0;
    const dqy = A > 0 ? (6 * Math.abs(My)) / (B * B * L) : 0;
    qMax = qAvg + dqx + dqy;
    qMin = qAvg - dqx - dqy;
  } else {
    // Kern dışı — basitleştirilmiş
    qMax = 2 * qAvg;
    qMin = 0;
  }

  const safe = qMax <= qa && qMin >= 0;

  return {
    method: type === "square" ? "Kare Temel" : type === "circular" ? "Dairesel Temel" : type === "strip" ? "Sürekli (Şerit) Temel" : "Dikdörtgen Temel",
    requiredArea: r(Areq, 2),
    B: r(B, 1),
    L: r(L, 1),
    netPressure: r(qAvg),
    ex: r(ex, 3),
    ey: r(ey, 3),
    pressureDistribution: { qMin: r(Math.max(qMin, 0)), qMax: r(qMax), qAvg: r(qAvg) },
    withinKern,
    safe,
  };
}

function r(v: number, d = 2) { return Math.round(v * 10 ** d) / 10 ** d; }
