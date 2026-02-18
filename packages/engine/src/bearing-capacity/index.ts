/**
 * GeoForce Engine — Taşıma Kapasitesi Hesapları
 * Terzaghi, Meyerhof, Hansen, Vesic yöntemleri
 */

export interface BearingCapacityInput {
  /** Temel genişliği B (m) */
  width: number;
  /** Temel uzunluğu L (m) — şerit temel için undefined veya çok büyük değer */
  length?: number;
  /** Temel derinliği Df (m) */
  depth: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Kohezyon c (kPa) */
  cohesion: number;
  /** İçsel sürtünme açısı φ (derece) */
  frictionAngle: number;
  /** Yeraltı su seviyesi derinliği (m) — temel tabanından itibaren */
  waterTableDepth?: number;
  /** Suyun birim hacim ağırlığı (kN/m³) — varsayılan 9.81 */
  gammaWater?: number;
  /** Güvenlik katsayısı — varsayılan 3.0 */
  safetyFactor?: number;
}

export interface BearingCapacityResult {
  method: string;
  /** Nihai taşıma kapasitesi qu (kPa) */
  ultimate: number;
  /** İzin verilebilir taşıma kapasitesi qa (kPa) */
  allowable: number;
  /** Güvenlik katsayısı */
  safetyFactor: number;
  /** Taşıma kapasitesi faktörleri */
  factors: {
    Nc: number;
    Nq: number;
    Ngamma: number;
  };
  /** Şekil faktörleri (varsa) */
  shapeFactors?: { sc: number; sq: number; sgamma: number };
  /** Derinlik faktörleri (varsa) */
  depthFactors?: { dc: number; dq: number; dgamma: number };
  /** Bileşenler (kPa) */
  components: {
    cohesionTerm: number;
    surchargeterm: number;
    weightTerm: number;
  };
}

// ─── Terzaghi ───

const TERZAGHI_TABLE: Record<number, [number, number, number]> = {
  0: [5.7, 1.0, 0.0], 5: [7.3, 1.6, 0.5], 10: [9.6, 2.7, 1.2],
  15: [12.9, 4.4, 2.5], 20: [17.7, 7.4, 5.0], 25: [25.1, 12.7, 9.7],
  26: [27.1, 14.2, 11.7], 28: [31.6, 17.8, 15.7], 30: [37.2, 22.5, 19.7],
  32: [44.0, 28.5, 27.9], 34: [52.6, 36.5, 36.0], 35: [57.8, 41.4, 42.4],
  36: [63.5, 47.2, 52.0], 38: [77.5, 61.5, 80.0], 40: [95.7, 81.3, 100.4],
  45: [172.3, 173.3, 297.5], 48: [258.3, 287.9, 780.1], 50: [347.5, 415.1, 1153.2],
};

function interpolateTerzaghi(phi: number): [number, number, number] {
  const keys = Object.keys(TERZAGHI_TABLE).map(Number).sort((a, b) => a - b);
  if (phi <= keys[0]) return TERZAGHI_TABLE[keys[0]];
  if (phi >= keys[keys.length - 1]) return TERZAGHI_TABLE[keys[keys.length - 1]];

  let lo = keys[0], hi = keys[keys.length - 1];
  for (const k of keys) {
    if (k <= phi) lo = k;
    if (k >= phi && k < hi) hi = k;
  }
  if (lo === hi) return TERZAGHI_TABLE[lo];

  const t = (phi - lo) / (hi - lo);
  const [Nc1, Nq1, Ng1] = TERZAGHI_TABLE[lo];
  const [Nc2, Nq2, Ng2] = TERZAGHI_TABLE[hi];
  return [
    Nc1 + t * (Nc2 - Nc1),
    Nq1 + t * (Nq2 - Nq1),
    Ng1 + t * (Ng2 - Ng1),
  ];
}

export function terzaghi(input: BearingCapacityInput): BearingCapacityResult {
  const { width: B, length: L, depth: Df, gamma, cohesion: c, frictionAngle: phi } = input;
  const FS = input.safetyFactor ?? 3.0;
  const [Nc, Nq, Ngamma] = interpolateTerzaghi(phi);

  const q = gamma * Df; // surcharge

  // Shape factors
  let sc = 1, sgamma = 1;
  if (L !== undefined && L > 0) {
    if (Math.abs(B - L) < 0.01) {
      // Square
      sc = 1.3; sgamma = 0.8;
    } else {
      // Rectangular — interpolate
      sc = 1 + 0.3 * (B / L);
      sgamma = 1 - 0.2 * (B / L);
    }
  }
  // Strip: sc=1, sgamma=1

  const cohesionTerm = c * Nc * sc;
  const surchargeTerm = q * Nq;
  const weightTerm = 0.5 * gamma * B * Ngamma * sgamma;

  const qu = cohesionTerm + surchargeTerm + weightTerm;
  const qa = qu / FS;

  return {
    method: "Terzaghi",
    ultimate: round(qu),
    allowable: round(qa),
    safetyFactor: FS,
    factors: { Nc: round(Nc), Nq: round(Nq), Ngamma: round(Ngamma) },
    shapeFactors: { sc: round(sc), sq: 1, sgamma: round(sgamma) },
    components: {
      cohesionTerm: round(cohesionTerm),
      surchargeterm: round(surchargeTerm),
      weightTerm: round(weightTerm),
    },
  };
}

// ─── Meyerhof ───

function meyerhofFactors(phi: number): [number, number, number] {
  const phiRad = (phi * Math.PI) / 180;
  const Nq = Math.exp(Math.PI * Math.tan(phiRad)) * Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
  const Nc = phi === 0 ? 5.14 : (Nq - 1) / Math.tan(phiRad);
  const Ngamma = (Nq - 1) * Math.tan(1.4 * phiRad);
  return [Nc, Nq, Ngamma];
}

export function meyerhof(input: BearingCapacityInput): BearingCapacityResult {
  const { width: B, length: L, depth: Df, gamma, cohesion: c, frictionAngle: phi } = input;
  const FS = input.safetyFactor ?? 3.0;
  const phiRad = (phi * Math.PI) / 180;
  const [Nc, Nq, Ngamma] = meyerhofFactors(phi);
  const q = gamma * Df;

  // Shape factors
  const Kp = Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
  const BL = L && L > 0 ? B / L : 0;
  const sc = 1 + 0.2 * Kp * BL;
  const sq = phi > 0 ? 1 + 0.1 * Kp * BL : 1;
  const sgamma = sq;

  // Depth factors
  const DB = Df / B;
  const dc = 1 + 0.2 * Math.sqrt(Kp) * DB;
  const dq = phi > 0 ? 1 + 0.1 * Math.sqrt(Kp) * DB : 1;
  const dgamma = dq;

  const cohesionTerm = c * Nc * sc * dc;
  const surchargeTerm = q * Nq * sq * dq;
  const weightTerm = 0.5 * gamma * B * Ngamma * sgamma * dgamma;

  const qu = cohesionTerm + surchargeTerm + weightTerm;
  const qa = qu / FS;

  return {
    method: "Meyerhof",
    ultimate: round(qu),
    allowable: round(qa),
    safetyFactor: FS,
    factors: { Nc: round(Nc), Nq: round(Nq), Ngamma: round(Ngamma) },
    shapeFactors: { sc: round(sc), sq: round(sq), sgamma: round(sgamma) },
    depthFactors: { dc: round(dc), dq: round(dq), dgamma: round(dgamma) },
    components: {
      cohesionTerm: round(cohesionTerm),
      surchargeterm: round(surchargeTerm),
      weightTerm: round(weightTerm),
    },
  };
}

// ─── Hansen ───

function hansenFactors(phi: number): [number, number, number] {
  const phiRad = (phi * Math.PI) / 180;
  const Nq = Math.exp(Math.PI * Math.tan(phiRad)) * Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
  const Nc = phi === 0 ? 5.14 : (Nq - 1) / Math.tan(phiRad);
  const Ngamma = 1.5 * (Nq - 1) * Math.tan(phiRad);
  return [Nc, Nq, Ngamma];
}

export function hansen(input: BearingCapacityInput): BearingCapacityResult {
  const { width: B, length: L, depth: Df, gamma, cohesion: c, frictionAngle: phi } = input;
  const FS = input.safetyFactor ?? 3.0;
  const phiRad = (phi * Math.PI) / 180;
  const [Nc, Nq, Ngamma] = hansenFactors(phi);
  const q = gamma * Df;

  const BL = L && L > 0 ? B / L : 0;

  // Shape factors
  const sc = phi === 0 ? 0.2 * BL + 1 : 1 + (Nq / Nc) * BL;
  const sq = 1 + BL * Math.tan(phiRad);
  const sgamma = 1 - 0.4 * BL;

  // Depth factors
  const DB = Df / B;
  const k = DB <= 1 ? DB : Math.atan(DB);
  const dc = 1 + 0.4 * k;
  const dq = 1 + 2 * Math.tan(phiRad) * Math.pow(1 - Math.sin(phiRad), 2) * k;
  const dgamma = 1;

  const cohesionTerm = c * Nc * sc * dc;
  const surchargeTerm = q * Nq * sq * dq;
  const weightTerm = 0.5 * gamma * B * Ngamma * sgamma * dgamma;

  const qu = cohesionTerm + surchargeTerm + weightTerm;
  const qa = qu / FS;

  return {
    method: "Hansen",
    ultimate: round(qu),
    allowable: round(qa),
    safetyFactor: FS,
    factors: { Nc: round(Nc), Nq: round(Nq), Ngamma: round(Ngamma) },
    shapeFactors: { sc: round(sc), sq: round(sq), sgamma: round(sgamma) },
    depthFactors: { dc: round(dc), dq: round(dq), dgamma: round(dgamma) },
    components: {
      cohesionTerm: round(cohesionTerm),
      surchargeterm: round(surchargeTerm),
      weightTerm: round(weightTerm),
    },
  };
}

// ─── Vesic ───

export function vesic(input: BearingCapacityInput): BearingCapacityResult {
  const { width: B, length: L, depth: Df, gamma, cohesion: c, frictionAngle: phi } = input;
  const FS = input.safetyFactor ?? 3.0;
  const phiRad = (phi * Math.PI) / 180;

  const Nq = Math.exp(Math.PI * Math.tan(phiRad)) * Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
  const Nc = phi === 0 ? 5.14 : (Nq - 1) / Math.tan(phiRad);
  const Ngamma = 2 * (Nq + 1) * Math.tan(phiRad);

  const q = gamma * Df;
  const BL = L && L > 0 ? B / L : 0;

  // Shape factors (same as Hansen)
  const sc = phi === 0 ? 0.2 * BL + 1 : 1 + (Nq / Nc) * BL;
  const sq = 1 + BL * Math.tan(phiRad);
  const sgamma = 1 - 0.4 * BL;

  // Depth factors (same as Hansen)
  const DB = Df / B;
  const k = DB <= 1 ? DB : Math.atan(DB);
  const dc = 1 + 0.4 * k;
  const dq = 1 + 2 * Math.tan(phiRad) * Math.pow(1 - Math.sin(phiRad), 2) * k;
  const dgamma = 1;

  const cohesionTerm = c * Nc * sc * dc;
  const surchargeTerm = q * Nq * sq * dq;
  const weightTerm = 0.5 * gamma * B * Ngamma * sgamma * dgamma;

  const qu = cohesionTerm + surchargeTerm + weightTerm;
  const qa = qu / FS;

  return {
    method: "Vesic",
    ultimate: round(qu),
    allowable: round(qa),
    safetyFactor: FS,
    factors: { Nc: round(Nc), Nq: round(Nq), Ngamma: round(Ngamma) },
    shapeFactors: { sc: round(sc), sq: round(sq), sgamma: round(sgamma) },
    depthFactors: { dc: round(dc), dq: round(dq), dgamma: round(dgamma) },
    components: {
      cohesionTerm: round(cohesionTerm),
      surchargeterm: round(surchargeTerm),
      weightTerm: round(weightTerm),
    },
  };
}

function round(v: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}
