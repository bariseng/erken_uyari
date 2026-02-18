/**
 * GeoForce Engine — Kazık Kapasitesi
 * α yöntemi (kil), β yöntemi (kum), SPT korelasyonları, Broms yanal yük
 */

export interface PileInput {
  /** Kazık çapı D (m) */
  diameter: number;
  /** Kazık uzunluğu L (m) */
  length: number;
  /** Kazık tipi */
  pileType: "driven" | "bored";
  /** Tabaka bilgileri */
  layers: PileSoilLayer[];
  /** Güvenlik katsayısı — varsayılan 2.5 */
  safetyFactor?: number;
}

export interface PileSoilLayer {
  /** Tabaka üst derinliği (m) */
  depthTop: number;
  /** Tabaka alt derinliği (m) */
  depthBottom: number;
  /** Zemin tipi */
  soilType: "clay" | "sand";
  /** Drenajsız kayma dayanımı cu (kPa) — kil için */
  cu?: number;
  /** İçsel sürtünme açısı φ (derece) — kum için */
  frictionAngle?: number;
  /** Birim hacim ağırlık γ (kN/m³) */
  gamma: number;
  /** SPT N değeri */
  N?: number;
}

export interface PileCapacityResult {
  method: string;
  /** Uç direnci Qp (kN) */
  tipCapacity: number;
  /** Çevre sürtünmesi Qs (kN) */
  shaftCapacity: number;
  /** Nihai taşıma kapasitesi Qu (kN) */
  ultimate: number;
  /** İzin verilebilir kapasite Qa (kN) */
  allowable: number;
  /** Güvenlik katsayısı */
  safetyFactor: number;
  /** Tabaka katkıları */
  layerDetails: { depth: string; type: string; qs: number; contribution: number }[];
}

export interface LateralPileInput {
  /** Kazık çapı D (m) */
  diameter: number;
  /** Kazık uzunluğu L (m) */
  length: number;
  /** Kazık EI (kN·m²) */
  EI: number;
  /** Zemin tipi */
  soilType: "clay" | "sand";
  /** cu (kPa) — kil için */
  cu?: number;
  /** φ (derece) — kum için */
  frictionAngle?: number;
  /** γ (kN/m³) */
  gamma: number;
  /** Mesnet koşulu */
  headCondition: "free" | "fixed";
}

export interface LateralPileResult {
  method: string;
  /** Nihai yanal yük kapasitesi Hu (kN) */
  ultimateLoad: number;
  /** İzin verilebilir yanal yük Ha (kN) */
  allowableLoad: number;
  /** Kazık davranışı */
  behavior: "short" | "long";
  behaviorTR: string;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const toRad = (d: number) => (d * Math.PI) / 180;

// ─── α Yöntemi (Kil) + β Yöntemi (Kum) ───

export function pileCapacityStatic(input: PileInput): PileCapacityResult {
  const { diameter: D, length: L, pileType, layers, safetyFactor: FS = 2.5 } = input;
  const Ap = Math.PI * D * D / 4; // uç alanı
  const perimeter = Math.PI * D;

  let Qs = 0;
  let sigmaV = 0; // efektif düşey gerilme takibi
  const details: PileCapacityResult["layerDetails"] = [];

  // Uç direnci — kazık ucundaki tabaka
  let Qp = 0;
  const tipLayer = layers.find(l => l.depthBottom >= L) || layers[layers.length - 1];

  if (tipLayer.soilType === "clay" && tipLayer.cu) {
    // Qp = 9 * cu * Ap
    Qp = 9 * tipLayer.cu * Ap;
  } else if (tipLayer.soilType === "sand" && tipLayer.frictionAngle) {
    const phiRad = toRad(tipLayer.frictionAngle);
    const Nq = Math.exp(Math.PI * Math.tan(phiRad)) * Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
    // σ'v at tip
    let tipSigmaV = 0;
    for (const l of layers) {
      const top = Math.max(l.depthTop, 0);
      const bot = Math.min(l.depthBottom, L);
      if (bot > top) tipSigmaV += l.gamma * (bot - top);
    }
    Qp = Nq * tipSigmaV * Ap;
    // Limit: Qp ≤ 50 * Nq * tan(φ) * Ap (kPa)
    const qpLimit = 50 * Nq * Math.tan(phiRad);
    Qp = Math.min(Qp, qpLimit * Ap);
  }

  // Çevre sürtünmesi
  for (const layer of layers) {
    const top = Math.max(layer.depthTop, 0);
    const bot = Math.min(layer.depthBottom, L);
    if (bot <= top) continue;
    const dz = bot - top;
    const zMid = (top + bot) / 2;

    let qs = 0; // birim çevre sürtünmesi (kPa)

    if (layer.soilType === "clay" && layer.cu) {
      // α yöntemi
      let alpha: number;
      if (layer.cu <= 25) alpha = 1.0;
      else if (layer.cu <= 50) alpha = 0.96;
      else if (layer.cu <= 100) alpha = 0.7;
      else if (layer.cu <= 200) alpha = 0.5;
      else alpha = 0.35;

      if (pileType === "bored") alpha *= 0.7; // bored kazık düzeltmesi
      qs = alpha * layer.cu;
    } else if (layer.soilType === "sand" && layer.frictionAngle) {
      // β yöntemi
      const phiRad = toRad(layer.frictionAngle);
      const K = pileType === "driven" ? 1.0 : 0.7; // K0 yaklaşımı
      const delta = pileType === "driven" ? layer.frictionAngle * 0.75 : layer.frictionAngle * 0.67;
      const sigmaVmid = layer.gamma * zMid;
      const beta = K * Math.tan(toRad(delta));
      qs = beta * sigmaVmid;
      // Limit
      qs = Math.min(qs, 200);
    }

    const layerQs = qs * perimeter * dz;
    Qs += layerQs;

    details.push({
      depth: `${top.toFixed(1)}-${bot.toFixed(1)}m`,
      type: layer.soilType === "clay" ? `Kil (cu=${layer.cu} kPa)` : `Kum (φ=${layer.frictionAngle}°)`,
      qs: round(qs),
      contribution: round(layerQs),
    });
  }

  const Qu = Qp + Qs;
  const Qa = Qu / FS;

  return {
    method: "α-β Yöntemi (Statik Formüller)",
    tipCapacity: round(Qp),
    shaftCapacity: round(Qs),
    ultimate: round(Qu),
    allowable: round(Qa),
    safetyFactor: FS,
    layerDetails: details,
  };
}

// ─── SPT Korelasyonları (Meyerhof, 1976) ───

export function pileCapacitySPT(input: PileInput): PileCapacityResult {
  const { diameter: D, length: L, pileType, layers, safetyFactor: FS = 2.5 } = input;
  const Ap = Math.PI * D * D / 4;
  const perimeter = Math.PI * D;

  const details: PileCapacityResult["layerDetails"] = [];

  // Uç direnci — Meyerhof
  const tipLayer = layers.find(l => l.depthBottom >= L) || layers[layers.length - 1];
  const Ntip = tipLayer.N ?? 15;
  // qp = 40 * N * (L/D) ≤ 400N (kPa) — çakma kazık
  let qp = 40 * Ntip * (L / D);
  const qpLimit = 400 * Ntip;
  qp = Math.min(qp, qpLimit);
  if (pileType === "bored") qp *= 0.33; // bored düzeltme
  const Qp = qp * Ap;

  // Çevre sürtünmesi
  let Qs = 0;
  for (const layer of layers) {
    const top = Math.max(layer.depthTop, 0);
    const bot = Math.min(layer.depthBottom, L);
    if (bot <= top) continue;
    const dz = bot - top;
    const N = layer.N ?? 10;

    let qs: number;
    if (layer.soilType === "clay") {
      qs = N / 2; // kPa — Decourt yaklaşımı
    } else {
      qs = pileType === "driven" ? 2 * N : N; // kPa — Meyerhof
    }
    qs = Math.min(qs, 170);

    const layerQs = qs * perimeter * dz;
    Qs += layerQs;

    details.push({
      depth: `${top.toFixed(1)}-${bot.toFixed(1)}m`,
      type: `${layer.soilType === "clay" ? "Kil" : "Kum"} (N=${N})`,
      qs: round(qs),
      contribution: round(layerQs),
    });
  }

  const Qu = Qp + Qs;
  const Qa = Qu / FS;

  return {
    method: "SPT Korelasyonu (Meyerhof, 1976)",
    tipCapacity: round(Qp),
    shaftCapacity: round(Qs),
    ultimate: round(Qu),
    allowable: round(Qa),
    safetyFactor: FS,
    layerDetails: details,
  };
}

// ─── Broms Yanal Yük ───

// ─── Kaya Soketi Kapasitesi — Zhang & Einstein (1998) ───

export interface RockSocketInput {
  /** Soket çapı (m) */
  socketDiameter: number;
  /** Soket uzunluğu (m) */
  socketLength: number;
  /** Kaya tek eksenli basınç dayanımı UCS (MPa) */
  rockUCS: number;
  /** Rock Quality Designation (%) */
  RQD: number;
  /** Güvenlik katsayısı — varsayılan 3.0 */
  safetyFactor?: number;
}

export interface RockSocketResult {
  method: string;
  /** Birim uç direnci qp (MPa) */
  unitTipResistance: number;
  /** Birim çevre sürtünmesi qs (MPa) */
  unitShaftResistance: number;
  /** Uç direnci Qp (kN) */
  tipCapacity: number;
  /** Çevre sürtünmesi Qs (kN) */
  shaftCapacity: number;
  /** Nihai kapasite Qu (kN) */
  ultimate: number;
  /** İzin verilebilir kapasite Qa (kN) */
  allowable: number;
  /** RQD düzeltme faktörü */
  rqdFactor: number;
  safetyFactor: number;
}

/**
 * Kaya soketi taşıma kapasitesi — Zhang & Einstein (1998)
 * qu bazlı uç direnci + çevre sürtünmesi
 */
export function rockSocketCapacity(input: RockSocketInput): RockSocketResult {
  const { socketDiameter: D, socketLength: Ls, rockUCS, RQD, safetyFactor: FS = 3.0 } = input;

  const Ap = Math.PI * D * D / 4;
  const perimeter = Math.PI * D;

  // Zhang & Einstein (1998) — MPa cinsinden
  const qp = 4.83 * Math.pow(rockUCS, 0.51); // MPa
  const qs = 0.4 * Math.pow(rockUCS, 0.5);   // MPa

  // RQD düzeltme faktörü (kötü kaya kalitesi için azaltma)
  let rqdFactor = 1.0;
  if (RQD < 70) rqdFactor = 0.6 + (RQD / 70) * 0.4;
  if (RQD < 25) rqdFactor = 0.3;

  const qpCorr = qp * rqdFactor;
  const qsCorr = qs * rqdFactor;

  // kN'a çevir (MPa → kPa: ×1000)
  const Qp = qpCorr * 1000 * Ap;
  const Qs = qsCorr * 1000 * perimeter * Ls;
  const Qu = Qp + Qs;
  const Qa = Qu / FS;

  return {
    method: "Zhang & Einstein (1998) — Kaya Soketi",
    unitTipResistance: round(qpCorr, 3),
    unitShaftResistance: round(qsCorr, 3),
    tipCapacity: round(Qp),
    shaftCapacity: round(Qs),
    ultimate: round(Qu),
    allowable: round(Qa),
    rqdFactor: round(rqdFactor, 2),
    safetyFactor: FS,
  };
}

// ─── Kaya Soketi Oturması — AASHTO (2002) ───

export interface RockSocketSettlementInput {
  /** Uygulanan yük (kN) */
  load: number;
  /** Soket çapı (m) */
  socketDiameter: number;
  /** Soket uzunluğu (m) */
  socketLength: number;
  /** Kaya elastisite modülü Er (MPa) */
  rockModulus: number;
  /** Beton elastisite modülü Ec (MPa) */
  concreteModulus: number;
}

export interface RockSocketSettlementResult {
  method: string;
  /** Elastik kısalma (mm) */
  elasticShortening: number;
  /** Uç oturması (mm) */
  tipSettlement: number;
  /** Toplam oturma (mm) */
  totalSettlement: number;
}

/**
 * AASHTO (2002) kaya soketi oturma hesabı
 * Elastik kısalma + uç oturması
 */
export function rockSocketSettlement(input: RockSocketSettlementInput): RockSocketSettlementResult {
  const { load, socketDiameter: D, socketLength: Ls, rockModulus: Er, concreteModulus: Ec } = input;

  const Ap = Math.PI * D * D / 4;

  // Elastik kısalma: δe = P * L / (Ap * Ec)
  // Ec MPa → kPa: ×1000, load kN, Ap m², Ls m → sonuç m → mm'ye çevir
  const elasticShortening = (load * Ls) / (Ap * Ec * 1000) * 1000; // mm

  // Uç oturması — Pells & Turner (1979) / AASHTO yaklaşımı
  // δtip = P / (D * Er * 1000) * Ip, Ip ≈ 0.5 (rijit dairesel temel)
  const Ip = 0.5;
  const tipSettlement = (load / (D * Er * 1000)) * Ip * 1000; // mm

  const total = elasticShortening + tipSettlement;

  return {
    method: "AASHTO (2002) — Kaya Soketi Oturması",
    elasticShortening: round(elasticShortening, 3),
    tipSettlement: round(tipSettlement, 3),
    totalSettlement: round(total, 3),
  };
}

// ─── EC7 Kazık Tasarımı ───

export interface EC7PileInput extends PileInput {
  /** Tasarım yaklaşımı */
  designApproach: "DA1-C1" | "DA1-C2" | "DA2";
  /** Kalıcı yük Gk (kN) */
  permanentLoad: number;
  /** Değişken yük Qk (kN) */
  variableLoad: number;
  /** Statik yükleme test sayısı */
  numberOfTests: number;
}

export interface EC7PileResult {
  method: string;
  /** Tasarım yükü Fd (kN) */
  designLoad: number;
  /** Karakteristik direnç Rk (kN) */
  characteristicResistance: number;
  /** Tasarım direnci Rd (kN) */
  designResistance: number;
  /** Kullanım oranı */
  utilisation: number;
  /** Korelasyon faktörleri */
  correlationFactors: { xi3: number; xi4: number };
  /** Kısmi faktörler */
  partialFactors: { gammaG: number; gammaQ: number; gammaB: number; gammaS: number };
  /** Yeterli mi? */
  adequate: boolean;
}

/**
 * EC7 Kazık Tasarımı — Design Approach 1 & 2
 */
export function pileCapacityEC7(input: EC7PileInput): EC7PileResult {
  const { designApproach, permanentLoad: Gk, variableLoad: Qk, numberOfTests: nTests } = input;

  // Korelasyon faktörleri ξ — test sayısına göre (EN 1997-1 Tablo A.10)
  const xiTable: Record<number, { xi3: number; xi4: number }> = {
    1: { xi3: 1.40, xi4: 1.40 },
    2: { xi3: 1.35, xi4: 1.27 },
    3: { xi3: 1.33, xi4: 1.23 },
    4: { xi3: 1.31, xi4: 1.20 },
    5: { xi3: 1.29, xi4: 1.15 },
  };
  const nKey = Math.min(Math.max(nTests, 1), 5);
  const xi = xiTable[nKey];

  // Kısmi faktörler
  let gammaG: number, gammaQ: number, gammaB: number, gammaS: number;

  switch (designApproach) {
    case "DA1-C1": // A1 + M1 + R1
      gammaG = 1.35; gammaQ = 1.5; gammaB = 1.0; gammaS = 1.0;
      break;
    case "DA1-C2": // A2 + M1 + R4
      gammaG = 1.0; gammaQ = 1.3; gammaB = 1.3; gammaS = 1.3;
      break;
    case "DA2": // A1 + M1 + R2
      gammaG = 1.35; gammaQ = 1.5; gammaB = 1.1; gammaS = 1.0;
      break;
  }

  // Tasarım yükü
  const Fd = gammaG * Gk + gammaQ * Qk;

  // Karakteristik direnç — mevcut statik hesaptan al
  const staticResult = pileCapacityStatic(input);
  const Rc = staticResult.ultimate;

  // Rk = min(Rc_mean / ξ3, Rc_min / ξ4) — tek test için ξ3 = ξ4
  const Rk = Math.min(Rc / xi.xi3, Rc / xi.xi4);

  // Tasarım direnci
  const tipRatio = staticResult.tipCapacity / Math.max(Rc, 0.001);
  const shaftRatio = staticResult.shaftCapacity / Math.max(Rc, 0.001);
  const Rd = (tipRatio * Rk) / gammaB + (shaftRatio * Rk) / gammaS;

  const utilisation = Fd / Math.max(Rd, 0.001);

  return {
    method: `EC7 Kazık Tasarımı — ${designApproach}`,
    designLoad: round(Fd),
    characteristicResistance: round(Rk),
    designResistance: round(Rd),
    utilisation: round(utilisation, 3),
    correlationFactors: xi,
    partialFactors: { gammaG, gammaQ, gammaB, gammaS },
    adequate: utilisation <= 1.0,
  };
}

export function lateralPileBroms(input: LateralPileInput): LateralPileResult {
  const { diameter: D, length: L, EI, soilType, cu, frictionAngle: phi, gamma, headCondition } = input;

  let Hu: number;
  let behavior: "short" | "long";

  if (soilType === "clay" && cu) {
    // Kil — Broms
    const Lc = 1.5 * D + (L > 10 * D ? 1.5 * D : 0);
    const relativeStiffness = Math.pow(EI / (cu * D), 0.25);
    const isLong = L > 3.5 * relativeStiffness;

    if (isLong) {
      behavior = "long";
      if (headCondition === "free") {
        Hu = 0.5 * cu * D * relativeStiffness * relativeStiffness;
      } else {
        Hu = 1.0 * cu * D * relativeStiffness * relativeStiffness;
      }
    } else {
      behavior = "short";
      if (headCondition === "free") {
        Hu = 4.5 * cu * D * L * (1 - 1.5 * D / L);
      } else {
        Hu = 9 * cu * D * L * (1 - 1.5 * D / L);
      }
    }
  } else if (phi) {
    // Kum — Broms
    const phiRad = toRad(phi);
    const Kp = Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
    const relativeStiffness = Math.pow(EI / (gamma * D * Kp), 0.2);
    const isLong = L > 4 * relativeStiffness;

    if (isLong) {
      behavior = "long";
      Hu = 0.5 * gamma * D * Kp * relativeStiffness * relativeStiffness * relativeStiffness;
      if (headCondition === "fixed") Hu *= 2;
    } else {
      behavior = "short";
      if (headCondition === "free") {
        Hu = 0.5 * gamma * D * L * L * Kp;
      } else {
        Hu = 1.5 * gamma * D * L * L * Kp;
      }
    }
  } else {
    Hu = 0;
    behavior = "short";
  }

  Hu = Math.max(Hu, 0);

  return {
    method: "Broms (1964)",
    ultimateLoad: round(Hu),
    allowableLoad: round(Hu / 2.5),
    behavior,
    behaviorTR: behavior === "long" ? "Uzun (esnek) kazık" : "Kısa (rijit) kazık",
  };
}
