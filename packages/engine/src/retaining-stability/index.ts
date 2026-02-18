/**
 * GeoForce Engine — Ağırlık İstinat Duvarı Stabilitesi & Donatılı Zemin
 */

// ─── Ağırlık İstinat Duvarı ───

export interface GravityWallInput {
  /** Duvar yüksekliği H (m) */
  height: number;
  /** Duvar taban genişliği B (m) */
  baseWidth: number;
  /** Duvar tepe genişliği Bt (m) */
  topWidth: number;
  /** Duvar birim hacim ağırlığı γc (kN/m³) — beton/taş */
  gammaWall: number;
  /** Dolgu birim hacim ağırlığı γ (kN/m³) */
  gammaFill: number;
  /** Dolgu sürtünme açısı φ (°) */
  frictionAngle: number;
  /** Dolgu kohezyon c (kPa) */
  cohesion?: number;
  /** Taban-zemin sürtünme katsayısı μ — varsayılan tan(2φ/3) */
  baseFriction?: number;
  /** Temel zemini taşıma kapasitesi qa (kPa) */
  bearingCapacity: number;
  /** Sürşarj q (kPa) */
  surcharge?: number;
  /** Sismik katsayı kh */
  kh?: number;
}

export interface GravityWallResult {
  method: string;
  /** Aktif basınç katsayısı Ka */
  Ka: number;
  /** Aktif kuvvet Pa (kN/m) */
  Pa: number;
  /** Duvar ağırlığı W (kN/m) */
  wallWeight: number;
  /** Devrilme güvenlik katsayısı FS_overturn */
  FS_overturn: number;
  /** Kayma güvenlik katsayısı FS_sliding */
  FS_sliding: number;
  /** Taban basıncı kontrolü */
  basePressure: { qToe: number; qHeel: number; qMax: number; withinCapacity: boolean };
  /** Eksantrisite e (m) */
  eccentricity: number;
  /** Orta 1/3 kontrolü */
  middleThird: boolean;
  /** Genel durum */
  stable: boolean;
  /** Detay */
  details: { label: string; value: string; ok: boolean }[];
}

const toRad = (d: number) => (d * Math.PI) / 180;
const rd = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export function gravityWallStability(input: GravityWallInput): GravityWallResult {
  const { height: H, baseWidth: B, topWidth: Bt, gammaWall, gammaFill, frictionAngle: phi, cohesion: c = 0, bearingCapacity: qa, surcharge: q = 0, kh = 0 } = input;

  const phiRad = toRad(phi);
  const Ka = Math.pow(Math.tan(Math.PI / 4 - phiRad / 2), 2);

  // Aktif kuvvet
  const Pa_soil = 0.5 * Ka * gammaFill * H * H;
  const Pa_surcharge = Ka * q * H;
  const Pa = Pa_soil + Pa_surcharge;

  // Sismik ek kuvvet (pseudo-statik)
  const Pa_seismic = kh * Pa;

  const Pa_total = Pa + Pa_seismic;

  // Duvar ağırlığı (trapez kesit)
  const A_wall = ((B + Bt) / 2) * H;
  const W = gammaWall * A_wall;

  // Duvar ağırlık merkezi (tabandan)
  // Trapez: x_cg = (B² + B*Bt + Bt²) / (3*(B+Bt)) — taban sol köşesinden
  // Basitleştirilmiş: dikdörtgen + üçgen
  const x_rect = Bt / 2;
  const A_rect = Bt * H;
  const x_tri = Bt + (B - Bt) / 3;
  const A_tri = ((B - Bt) * H) / 2;
  const x_cg = A_wall > 0 ? (A_rect * x_rect + A_tri * x_tri) / A_wall : B / 2;

  // Devrilme — ayak ucundan (toe) moment
  const M_resist = W * x_cg + (q > 0 ? q * B * B / 2 : 0);
  const M_overturn = Pa_soil * H / 3 + Pa_surcharge * H / 2 + Pa_seismic * H / 2;

  const FS_overturn = M_overturn > 0 ? rd(M_resist / M_overturn) : 99;

  // Kayma
  const mu = input.baseFriction ?? Math.tan(toRad(2 * phi / 3));
  const F_resist = W * mu + c * B;
  const FS_sliding = Pa_total > 0 ? rd(F_resist / Pa_total) : 99;

  // Taban basıncı
  const R_x = Pa_total; // yatay
  const R_y = W; // düşey
  const M_net = M_resist - M_overturn;
  const x_R = R_y > 0 ? M_net / R_y : B / 2;
  const e = B / 2 - x_R;
  const middleThird = Math.abs(e) <= B / 6;

  let qToe: number, qHeel: number;
  if (middleThird) {
    qToe = (R_y / B) * (1 + 6 * e / B);
    qHeel = (R_y / B) * (1 - 6 * e / B);
  } else {
    qToe = (2 * R_y) / (3 * (B / 2 - e));
    qHeel = 0;
  }

  const qMax = Math.max(qToe, qHeel);
  const withinCapacity = qMax <= qa;

  const stable = FS_overturn >= 2 && FS_sliding >= 1.5 && withinCapacity && middleThird;

  const details: GravityWallResult["details"] = [
    { label: "Devrilme FS ≥ 2.0", value: FS_overturn.toString(), ok: FS_overturn >= 2 },
    { label: "Kayma FS ≥ 1.5", value: FS_sliding.toString(), ok: FS_sliding >= 1.5 },
    { label: "Taşıma kapasitesi", value: `${rd(qMax)} ≤ ${qa} kPa`, ok: withinCapacity },
    { label: "Orta 1/3 kuralı", value: `e=${rd(Math.abs(e), 3)}m ≤ B/6=${rd(B / 6, 3)}m`, ok: middleThird },
  ];

  return {
    method: "Ağırlık İstinat Duvarı Stabilitesi",
    Ka: rd(Ka, 4), Pa: rd(Pa_total), wallWeight: rd(W),
    FS_overturn, FS_sliding,
    basePressure: { qToe: rd(qToe), qHeel: rd(Math.max(qHeel, 0)), qMax: rd(qMax), withinCapacity },
    eccentricity: rd(Math.abs(e), 3), middleThird, stable, details,
  };
}

// ─── Donatılı Zemin (Geogrid) ───

export interface ReinforcedSoilInput {
  /** Duvar yüksekliği H (m) */
  height: number;
  /** Dolgu birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Dolgu sürtünme açısı φ (°) */
  frictionAngle: number;
  /** Sürşarj q (kPa) */
  surcharge?: number;
  /** Geogrid çekme dayanımı Tult (kN/m) */
  geogridStrength: number;
  /** Geogrid güvenlik katsayısı (creep, hasar, bağlantı) */
  geogridFS?: number;
  /** Düşey aralık Sv (m) */
  verticalSpacing: number;
  /** Donatı-zemin sürtünme katsayısı Ci */
  interactionCoeff?: number;
}

export interface ReinforcedSoilResult {
  method: string;
  /** İzin verilebilir geogrid dayanımı Ta (kN/m) */
  allowableStrength: number;
  /** Gerekli donatı uzunluğu Le (m) */
  requiredLength: number;
  /** Toplam donatı uzunluğu L (m) — Le + La */
  totalLength: number;
  /** Donatı sayısı */
  numberOfLayers: number;
  /** Tabaka detayları */
  layers: { depth: number; sigma_h: number; T_required: number; Le: number; L_total: number }[];
  /** İç stabilite FS */
  FS_internal: number;
  /** Dış stabilite (kayma) FS */
  FS_external: number;
}

export function reinforcedSoilDesign(input: ReinforcedSoilInput): ReinforcedSoilResult {
  const { height: H, gamma, frictionAngle: phi, surcharge: q = 0, geogridStrength: Tult, geogridFS: FS_gg = 3, verticalSpacing: Sv, interactionCoeff: Ci = 0.8 } = input;

  const phiRad = toRad(phi);
  const Ka = Math.pow(Math.tan(Math.PI / 4 - phiRad / 2), 2);
  const Ta = Tult / FS_gg;

  const nLayers = Math.ceil(H / Sv);
  const layers: ReinforcedSoilResult["layers"] = [];

  let maxT = 0;

  for (let i = 1; i <= nLayers; i++) {
    const z = i * Sv;
    const sigma_v = gamma * z + q;
    const sigma_h = Ka * sigma_v;
    const T_req = sigma_h * Sv;

    // Ankraj uzunluğu: Le = T / (2 * Ci * σv * tan(φ))
    const Le = T_req / (2 * Ci * sigma_v * Math.tan(phiRad));

    // Aktif bölge uzunluğu: La = (H - z) * tan(45 - φ/2)
    const La = (H - z) * Math.tan(Math.PI / 4 - phiRad / 2);

    const L_total = Le + La;
    maxT = Math.max(maxT, T_req);

    layers.push({
      depth: rd(z, 1),
      sigma_h: rd(sigma_h),
      T_required: rd(T_req),
      Le: rd(Le, 2),
      L_total: rd(L_total, 2),
    });
  }

  const FS_internal = maxT > 0 ? rd(Ta / maxT) : 99;

  // Dış stabilite — kayma
  const Pa = 0.5 * Ka * gamma * H * H + Ka * q * H;
  const L_design = layers.length > 0 ? Math.max(...layers.map(l => l.L_total)) : H * 0.7;
  const W_block = gamma * H * L_design;
  const F_resist = W_block * Math.tan(phiRad) * Ci;
  const FS_external = Pa > 0 ? rd(F_resist / Pa) : 99;

  return {
    method: "Donatılı Zemin (Geogrid) — FHWA Yöntemi",
    allowableStrength: rd(Ta),
    requiredLength: rd(L_design, 2),
    totalLength: rd(L_design, 2),
    numberOfLayers: nLayers,
    layers,
    FS_internal,
    FS_external,
  };
}
