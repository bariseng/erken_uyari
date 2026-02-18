/**
 * GeoForce Engine — Yanal Toprak Basıncı
 * Rankine, Coulomb ve Mononobe-Okabe yöntemleri
 */

export interface LateralPressureInput {
  /** Duvar yüksekliği H (m) */
  wallHeight: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Kohezyon c (kPa) */
  cohesion: number;
  /** İçsel sürtünme açısı φ (derece) */
  frictionAngle: number;
  /** Sürşarj yükü q (kPa) — varsayılan 0 */
  surcharge?: number;
  /** Yeraltı su seviyesi derinliği (m) — duvar tepesinden */
  waterTableDepth?: number;
  /** Duvar-zemin sürtünme açısı δ (derece) — Coulomb için */
  wallFriction?: number;
  /** Dolgu yüzey eğimi β (derece) — varsayılan 0 */
  backfillSlope?: number;
  /** Duvar eğimi α (derece, düşeyden) — varsayılan 0 */
  wallInclination?: number;
  /** Yatay sismik katsayı kh — Mononobe-Okabe için */
  kh?: number;
  /** Düşey sismik katsayı kv — Mononobe-Okabe için */
  kv?: number;
}

export interface PressureProfile {
  /** Derinlik noktaları (m) */
  depths: number[];
  /** Basınç değerleri (kPa) */
  pressures: number[];
}

export interface LateralPressureResult {
  method: string;
  /** Aktif toprak basıncı katsayısı Ka */
  Ka: number;
  /** Pasif toprak basıncı katsayısı Kp */
  Kp: number;
  /** Sükûnet toprak basıncı katsayısı K0 */
  K0: number;
  /** Toplam aktif kuvvet Pa (kN/m) */
  activeForcePa: number;
  /** Toplam pasif kuvvet Pp (kN/m) */
  passiveForcePp: number;
  /** Aktif kuvvet uygulama noktası (m, tabandan) */
  activeForceLocation: number;
  /** Aktif basınç profili */
  activeProfile: PressureProfile;
  /** Pasif basınç profili */
  passiveProfile: PressureProfile;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ─── Rankine ───

export function rankine(input: LateralPressureInput): LateralPressureResult {
  const { wallHeight: H, gamma, cohesion: c, frictionAngle: phi, surcharge: q = 0 } = input;
  const phiRad = toRad(phi);

  const Ka = Math.pow(Math.tan(Math.PI / 4 - phiRad / 2), 2);
  const Kp = Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
  const K0 = 1 - Math.sin(phiRad);

  // Active pressure at depth z: σa = Ka * (γz + q) - 2c√Ka
  // Passive pressure at depth z: σp = Kp * γz + 2c√Kp
  const sqrtKa = Math.sqrt(Ka);
  const sqrtKp = Math.sqrt(Kp);

  const steps = 20;
  const dz = H / steps;
  const depths: number[] = [];
  const activePressures: number[] = [];
  const passivePressures: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const z = i * dz;
    depths.push(round(z, 3));
    const sigmaA = Math.max(0, Ka * (gamma * z + q) - 2 * c * sqrtKa);
    const sigmaP = Kp * gamma * z + 2 * c * sqrtKp;
    activePressures.push(round(sigmaA));
    passivePressures.push(round(sigmaP));
  }

  // Total active force (trapezoidal integration)
  let Pa = 0;
  let moment = 0;
  for (let i = 0; i < steps; i++) {
    const avgP = (activePressures[i] + activePressures[i + 1]) / 2;
    const force = avgP * dz;
    const arm = H - (depths[i] + dz / 2);
    Pa += force;
    moment += force * arm;
  }

  const Pp = 0.5 * Kp * gamma * H * H + 2 * c * sqrtKp * H;
  const activeLocation = Pa > 0 ? moment / Pa : H / 3;

  return {
    method: "Rankine",
    Ka: round(Ka, 4),
    Kp: round(Kp, 4),
    K0: round(K0, 4),
    activeForcePa: round(Pa),
    passiveForcePp: round(Pp),
    activeForceLocation: round(activeLocation),
    activeProfile: { depths, pressures: activePressures },
    passiveProfile: { depths, pressures: passivePressures },
  };
}

// ─── Coulomb ───

export function coulomb(input: LateralPressureInput): LateralPressureResult {
  const {
    wallHeight: H, gamma, cohesion: c, frictionAngle: phi, surcharge: q = 0,
    wallFriction: delta = phi * 2 / 3,
    backfillSlope: beta = 0,
    wallInclination: alpha = 0,
  } = input;

  const phiR = toRad(phi);
  const deltaR = toRad(delta);
  const betaR = toRad(beta);
  // alpha input is from vertical; Coulomb formula uses angle from horizontal = 90 - alpha
  const alphaR = toRad(90 - alpha);

  // Coulomb Ka
  const num = Math.pow(Math.sin(alphaR + phiR), 2);
  const sinAlpha2 = Math.pow(Math.sin(alphaR), 2);
  const term1 = Math.sin(phiR + deltaR) * Math.sin(phiR - betaR);
  const term2 = Math.sin(alphaR - deltaR) * Math.sin(alphaR + betaR);
  const sqrtRatio = term2 > 0.0001 ? Math.sqrt(term1 / term2) : 0;
  const denom = sinAlpha2 * Math.sin(alphaR - deltaR) * Math.pow(1 + sqrtRatio, 2);
  const Ka = denom > 0.0001 ? num / denom : 0;

  // Coulomb Kp
  const numP = Math.pow(Math.sin(alphaR - phiR), 2);
  const term1P = Math.sin(phiR + deltaR) * Math.sin(phiR + betaR);
  const term2P = Math.sin(alphaR + deltaR) * Math.sin(alphaR + betaR);
  const sqrtRatioP = term2P > 0.0001 ? Math.sqrt(term1P / term2P) : 0;
  const denomP = sinAlpha2 * Math.sin(alphaR + deltaR) * Math.pow(1 - sqrtRatioP, 2);
  const Kp = denomP > 0.0001 ? numP / denomP : 0;

  const K0 = 1 - Math.sin(phiR);

  // Pressure profiles (simplified — ignoring cohesion for Coulomb)
  const steps = 20;
  const dz = H / steps;
  const depths: number[] = [];
  const activePressures: number[] = [];
  const passivePressures: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const z = i * dz;
    depths.push(round(z, 3));
    activePressures.push(round(Ka * (gamma * z + q)));
    passivePressures.push(round(Kp * gamma * z));
  }

  const Pa = 0.5 * Ka * gamma * H * H + Ka * q * H;
  const Pp = 0.5 * Kp * gamma * H * H;

  // Force location
  const Pa_soil = 0.5 * Ka * gamma * H * H;
  const Pa_surcharge = Ka * q * H;
  const totalPa = Pa_soil + Pa_surcharge;
  const activeLocation = totalPa > 0
    ? (Pa_soil * H / 3 + Pa_surcharge * H / 2) / totalPa
    : H / 3;

  return {
    method: "Coulomb",
    Ka: round(Ka, 4),
    Kp: round(Kp, 4),
    K0: round(K0, 4),
    activeForcePa: round(Pa),
    passiveForcePp: round(Pp),
    activeForceLocation: round(activeLocation),
    activeProfile: { depths, pressures: activePressures },
    passiveProfile: { depths, pressures: passivePressures },
  };
}

// ─── Mononobe-Okabe (Depremli Durum) ───

export function mononobeOkabe(input: LateralPressureInput): LateralPressureResult {
  const {
    wallHeight: H, gamma, cohesion: c, frictionAngle: phi, surcharge: q = 0,
    wallFriction: delta = phi * 2 / 3,
    backfillSlope: beta = 0,
    wallInclination: alpha = 0,
    kh = 0, kv = 0,
  } = input;

  const phiR = toRad(phi);
  const deltaR = toRad(delta);
  const betaR = toRad(beta);
  const alphaR = toRad(90 - alpha);

  // Seismic inertia angle
  const theta = Math.atan(kh / (1 - kv));

  // M-O Active coefficient
  const num = Math.pow(Math.sin(alphaR + phiR - theta), 2);
  const cosTheta = Math.cos(theta);
  const sinAlpha2 = Math.pow(Math.sin(alphaR), 2);
  const t1 = Math.sin(phiR + deltaR) * Math.sin(phiR - betaR - theta);
  const t2 = Math.sin(alphaR - deltaR - theta) * Math.sin(alphaR + betaR);
  const sqrtTerm = t2 > 0 ? Math.sqrt(t1 / t2) : 0;
  const denom = cosTheta * sinAlpha2 * Math.sin(alphaR - deltaR - theta) * Math.pow(1 + sqrtTerm, 2);
  const Kae = denom > 0 ? num / denom : 0;

  // Static Ka for comparison
  const staticResult = coulomb(input);
  const Ka = staticResult.Ka;
  const Kp = staticResult.Kp;
  const K0 = 1 - Math.sin(phiR);

  // Dynamic increment
  const deltaKa = Kae - Ka;

  // Total seismic active force
  const Pa_static = 0.5 * Ka * gamma * H * H;
  const Pa_dynamic = 0.5 * deltaKa * gamma * H * H;
  const Pa_total = 0.5 * Kae * gamma * H * H + Kae * q * H;

  // Location: static at H/3, dynamic at 0.6H
  const activeLocation = Pa_total > 0
    ? (Pa_static * H / 3 + Pa_dynamic * 0.6 * H) / (Pa_static + Pa_dynamic)
    : H / 3;

  const steps = 20;
  const dz = H / steps;
  const depths: number[] = [];
  const activePressures: number[] = [];
  const passivePressures: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const z = i * dz;
    depths.push(round(z, 3));
    activePressures.push(round(Kae * (gamma * z + q)));
    passivePressures.push(round(Kp * gamma * z));
  }

  return {
    method: "Mononobe-Okabe",
    Ka: round(Kae, 4),
    Kp: round(Kp, 4),
    K0: round(K0, 4),
    activeForcePa: round(Pa_total),
    passiveForcePp: round(staticResult.passiveForcePp),
    activeForceLocation: round(activeLocation),
    activeProfile: { depths, pressures: activePressures },
    passiveProfile: { depths, pressures: passivePressures },
  };
}
