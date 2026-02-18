/**
 * GeoForce Engine — Tekil Temel Yapısal Tasarım
 * Zımbalama (punching shear), eğilme, kayma, devrilme kontrolleri
 */

export interface PadFootingInput {
  /** Kolon genişliği (m) — kare kolon varsayımı */
  columnWidth: number;
  /** Temel genişliği B (m) */
  footingWidth: number;
  /** Temel uzunluğu L (m) */
  footingLength: number;
  /** Temel kalınlığı h (m) */
  footingDepth: number;
  /** Faydalı yükseklik d (m) */
  effectiveDepth: number;
  /** Düşey yük N (kN) */
  load: number;
  /** Moment M (kN·m) — tek yönlü */
  moment: number;
  /** Yatay kuvvet H (kN) */
  horizontalForce: number;
  /** Beton karakteristik basınç dayanımı fck (MPa) */
  fck: number;
  /** Zemin taşıma basıncı q (kPa) — net taban basıncı */
  bearingPressure: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Pasif toprak basıncı katsayısı Kp — varsayılan 3.0 */
  Kp?: number;
  /** Taban-zemin sürtünme açısı δ (derece) — varsayılan 20 */
  baseFrictionAngle?: number;
}

export interface PadFootingResult {
  method: string;
  /** Zımbalama kontrolü */
  punchingShearCheck: {
    /** Zımbalama kuvveti Vp (kN) */
    punchingForce: number;
    /** Zımbalama çevresi (m) */
    punchingPerimeter: number;
    /** Zımbalama gerilmesi vp (MPa) */
    punchingStress: number;
    /** İzin verilebilir zımbalama gerilmesi (MPa) */
    allowableStress: number;
    /** Yeterli mi? */
    adequate: boolean;
  };
  /** Eğilme momenti (kN·m/m) — konsol kol */
  bendingMoment: number;
  /** Gerekli donatı alanı As (cm²/m) */
  steelArea: number;
  /** Kayma (sliding) güvenlik sayısı */
  slidingFS: number;
  /** Devrilme güvenlik sayısı */
  overturningFS: number;
  /** Taban basıncı dağılımı */
  pressureDistribution: { qMax: number; qMin: number; eccentricity: number };
  /** Genel değerlendirme */
  assessment: string;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const toRad = (d: number) => (d * Math.PI) / 180;

/**
 * Tekil Temel Yapısal Tasarım
 * Zımbalama, eğilme, kayma, devrilme kontrolleri
 */
export function padFootingDesign(input: PadFootingInput): PadFootingResult {
  const {
    columnWidth: c, footingWidth: B, footingLength: L, footingDepth: h,
    effectiveDepth: d, load: N, moment: M, horizontalForce: H,
    fck, bearingPressure: q, gamma, Kp = 3.0, baseFrictionAngle: delta = 20,
  } = input;

  // ─── Taban basıncı dağılımı ───
  const A = B * L;
  const e = M / N; // eksantrisite
  const qMax = (N / A) * (1 + 6 * e / L);
  const qMin = (N / A) * (1 - 6 * e / L);

  // ─── Zımbalama (Punching Shear) Kontrolü ───
  // Kritik çevre: kolon kenarından d/2 mesafede
  const punchWidth = c + d;
  const punchLength = c + d;
  const Apunch = punchWidth * punchLength;
  const Vp = q * (A - Apunch); // kN
  const punchPerimeter = 2 * (punchWidth + punchLength);
  const vp = Vp / (punchPerimeter * d * 1000); // MPa (d metre, 1000 kPa→MPa dönüşümü)
  const vpAllow = 0.5 * Math.sqrt(fck); // MPa
  const punchAdequate = vp <= vpAllow;

  // ─── Eğilme Momenti — Konsol Kol ───
  const cantilever = (B - c) / 2; // konsol uzunluğu
  const Mu = q * cantilever * cantilever / 2; // kN·m/m

  // ─── Gerekli Donatı Alanı ───
  // As = Mu / (0.87 * fyk * z), fyk ≈ 420 MPa, z ≈ 0.9d
  const fyk = 420; // MPa
  const z = 0.9 * d;
  const As = (Mu * 1e-3) / (0.87 * fyk * z) * 1e4; // cm²/m

  // ─── Devrilme Kontrolü ───
  // FS = M_stabilize / M_devrilme ≥ 1.5
  const Mstab = N * (L / 2);
  const Moverturning = M + H * h;
  const overturningFS = Moverturning > 0 ? Mstab / Moverturning : 999;

  // ─── Kayma Kontrolü ───
  // FS = (V·tanδ + Pp) / H ≥ 1.5
  const Pp = 0.5 * Kp * gamma * h * h * B; // pasif direnç (kN)
  const slidingResistance = N * Math.tan(toRad(delta)) + Pp;
  const slidingFS = H > 0 ? slidingResistance / H : 999;

  // ─── Değerlendirme ───
  const checks = [
    punchAdequate ? "✓ Zımbalama" : "✗ Zımbalama yetersiz",
    overturningFS >= 1.5 ? "✓ Devrilme" : "✗ Devrilme yetersiz",
    slidingFS >= 1.5 ? "✓ Kayma" : "✗ Kayma yetersiz",
    qMin >= 0 ? "✓ Taban basıncı (+)" : "⚠ Çekme bölgesi var",
  ];
  const allOk = punchAdequate && overturningFS >= 1.5 && slidingFS >= 1.5 && qMin >= 0;
  const assessment = allOk
    ? "Tüm kontroller sağlanıyor"
    : `Kontrol sonuçları: ${checks.join(", ")}`;

  return {
    method: "Tekil Temel Yapısal Tasarım (ACI 318 / TS500 yaklaşımı)",
    punchingShearCheck: {
      punchingForce: round(Vp),
      punchingPerimeter: round(punchPerimeter, 3),
      punchingStress: round(vp, 4),
      allowableStress: round(vpAllow, 4),
      adequate: punchAdequate,
    },
    bendingMoment: round(Mu, 2),
    steelArea: round(As, 2),
    slidingFS: round(slidingFS, 2),
    overturningFS: round(overturningFS, 2),
    pressureDistribution: { qMax: round(qMax, 2), qMin: round(qMin, 2), eccentricity: round(e, 4) },
    assessment,
  };
}
