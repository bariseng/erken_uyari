/**
 * GeoForce Engine — İksa (Derin Kazı) Tasarımı
 * Ankrajlı/destekli perde analizi, serbest ve ankastre mesnet
 */

export interface RetainingWallInput {
  /** Kazı derinliği H (m) */
  excavationDepth: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Kohezyon c (kPa) */
  cohesion: number;
  /** İçsel sürtünme açısı φ (derece) */
  frictionAngle: number;
  /** Sürşarj q (kPa) */
  surcharge?: number;
  /** Yeraltı su seviyesi derinliği (m) */
  waterTableDepth?: number;
  /** Ankraj/destek seviyeleri (m, kazı üstünden) */
  supportLevels?: number[];
  /** Mesnet koşulu */
  condition: "cantilever" | "single_anchor" | "multi_anchor";
  /** Sismik katsayı kh */
  kh?: number;
}

export interface RetainingWallResult {
  method: string;
  /** Gerekli gömme derinliği D (m) */
  embedmentDepth: number;
  /** Toplam perde uzunluğu (m) */
  totalLength: number;
  /** Maksimum moment Mmax (kN·m/m) */
  maxMoment: number;
  /** Ankraj kuvvetleri (kN/m) */
  anchorForces: number[];
  /** Aktif basınç katsayısı Ka */
  Ka: number;
  /** Pasif basınç katsayısı Kp */
  Kp: number;
  /** Basınç diyagramı */
  pressureDiagram: { depth: number; active: number; passive: number }[];
  /** Güvenlik katsayısı (gömme derinliği) */
  FS: number;
}

const toRad = (d: number) => (d * Math.PI) / 180;
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export function analyzeRetainingWall(input: RetainingWallInput): RetainingWallResult {
  const { excavationDepth: H, gamma, cohesion: c, frictionAngle: phi, surcharge: q = 0, condition, kh = 0 } = input;
  const phiRad = toRad(phi);

  const Ka = Math.pow(Math.tan(Math.PI / 4 - phiRad / 2), 2);
  const Kp = Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);

  // Seismic adjustment
  const KaEff = kh > 0 ? Ka * (1 + kh / Math.tan(phiRad || 0.01)) : Ka;

  let D: number;
  let Mmax: number;
  let anchorForces: number[] = [];

  if (condition === "cantilever") {
    // Konsol perde — Blum yöntemi (basitleştirilmiş)
    // Aktif kuvvet: Pa = 0.5 * Ka * γ * (H+D)² + Ka * q * (H+D) - 2c√Ka * (H+D)
    // Pasif kuvvet: Pp = 0.5 * Kp * γ * D² + 2c√Kp * D
    // Denge: Pp * D/3 = Pa * (H+D)/3 → iteratif çözüm

    D = 0.5;
    for (let iter = 0; iter < 100; iter++) {
      const totalH = H + D;
      const Pa = 0.5 * KaEff * gamma * totalH * totalH + KaEff * q * totalH - 2 * c * Math.sqrt(Ka) * totalH;
      const Pp = 0.5 * Kp * gamma * D * D + 2 * c * Math.sqrt(Kp) * D;

      const Ma = Pa * totalH / 3; // moment at base
      const Mp = Pp * D / 3;

      if (Mp >= Ma * 1.5) break; // FS = 1.5
      D += 0.1;
      if (D > H * 3) break;
    }

    const totalH = H + D;
    const Pa = Math.max(0, 0.5 * KaEff * gamma * totalH * totalH + KaEff * q * totalH - 2 * c * Math.sqrt(Ka) * totalH);
    Mmax = Pa * totalH / 3;

  } else if (condition === "single_anchor") {
    // Tek ankrajlı — serbest mesnet yöntemi
    const anchorDepth = input.supportLevels?.[0] ?? H * 0.3;

    // Basitleştirilmiş: D from moment equilibrium about anchor
    D = 0.5;
    for (let iter = 0; iter < 100; iter++) {
      const Pa = 0.5 * KaEff * gamma * (H + D) * (H + D) + KaEff * q * (H + D);
      const Pp = 0.5 * Kp * gamma * D * D + 2 * c * Math.sqrt(Kp) * D;

      const armPa = (H + D) / 3 - anchorDepth;
      const armPp = H + D / 3 - anchorDepth;

      const Ma = Pa * Math.abs(armPa);
      const Mp = Pp * Math.abs(armPp);

      if (Mp >= Ma * 1.5) break;
      D += 0.1;
      if (D > H * 2) break;
    }

    const Pa = 0.5 * KaEff * gamma * (H + D) * (H + D) + KaEff * q * (H + D);
    const Pp = 0.5 * Kp * gamma * D * D + 2 * c * Math.sqrt(Kp) * D;
    const T = Pa - Pp; // ankraj kuvveti
    anchorForces = [round(Math.max(T, 0))];
    Mmax = Pa * (H + D) / 3;

  } else {
    // Çok ankrajlı — apparent earth pressure (Peck, 1969)
    const supports = input.supportLevels ?? [H * 0.25, H * 0.6];

    // Apparent pressure
    let pa: number;
    if (c > 0 && phi === 0) {
      // Kil: pa = γH - 4cu (veya 0.2γH - 0.4γH arası)
      pa = Math.max(0.2 * gamma * H, gamma * H - 4 * c);
    } else {
      // Kum: pa = 0.65 * Ka * γ * H
      pa = 0.65 * KaEff * gamma * H;
    }

    // Ankraj kuvvetleri — tributary area yöntemi
    anchorForces = [];
    const allLevels = [0, ...supports, H];
    for (let i = 1; i < allLevels.length - 1; i++) {
      const above = (allLevels[i] - allLevels[i - 1]) / 2;
      const below = (allLevels[i + 1] - allLevels[i]) / 2;
      const tributaryH = above + below;
      anchorForces.push(round(pa * tributaryH));
    }

    D = H * 0.2; // minimum gömme
    Mmax = pa * H * H / 10; // yaklaşık
  }

  D = round(D);
  Mmax = round(Math.abs(Mmax));

  // Basınç diyagramı
  const totalL = H + D;
  const steps = 20;
  const diagram: RetainingWallResult["pressureDiagram"] = [];
  for (let i = 0; i <= steps; i++) {
    const z = (i / steps) * totalL;
    const active = Math.max(0, KaEff * (gamma * z + q) - 2 * c * Math.sqrt(Ka));
    const passive = z > H ? Kp * gamma * (z - H) + 2 * c * Math.sqrt(Kp) : 0;
    diagram.push({ depth: round(z, 1), active: round(active), passive: round(passive) });
  }

  const Pp = 0.5 * Kp * gamma * D * D + 2 * c * Math.sqrt(Kp) * D;
  const Pa = 0.5 * KaEff * gamma * totalL * totalL;
  const FS = Pa > 0 ? round(Pp / (Pa * 0.33), 2) : 99;

  return {
    method: condition === "cantilever" ? "Konsol Perde (Blum)" : condition === "single_anchor" ? "Tek Ankrajlı (Serbest Mesnet)" : "Çok Ankrajlı (Peck Apparent Pressure)",
    embedmentDepth: D,
    totalLength: round(H + D),
    maxMoment: Mmax,
    anchorForces,
    Ka: round(Ka, 4),
    Kp: round(Kp, 4),
    pressureDiagram: diagram,
    FS,
  };
}
