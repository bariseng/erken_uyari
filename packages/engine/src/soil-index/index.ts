/**
 * GeoForce Engine — Atterberg Limitleri, Plastisite Kartı & Dane Dağılımı
 */

// ─── Atterberg ───

export interface AtterbergInput {
  /** Likit limit LL (%) */
  liquidLimit: number;
  /** Plastik limit PL (%) */
  plasticLimit: number;
  /** Doğal su muhtevası w (%) — opsiyonel */
  naturalWaterContent?: number;
}

export interface AtterbergResult {
  /** Plastisite indisi PI (%) */
  PI: number;
  /** Likidite indisi LI */
  LI?: number;
  /** Kıvam indisi CI */
  CI?: number;
  /** Aktivite (PI / kil yüzdesi) — kil yüzdesi verilmişse */
  activity?: number;
  /** Casagrande plastisite kartı konumu */
  chartPosition: "A-line above" | "A-line below" | "on A-line";
  /** USCS grubu (ince dane) */
  uscsGroup: string;
  /** Kıvam durumu */
  consistencyState?: string;
}

export function atterbergLimits(input: AtterbergInput & { clayPercent?: number }): AtterbergResult {
  const { liquidLimit: LL, plasticLimit: PL, naturalWaterContent: w, clayPercent } = input;
  const PI = r(LL - PL, 1);

  // A-line: PI = 0.73 * (LL - 20)
  const aLine = 0.73 * (LL - 20);
  const chartPosition: AtterbergResult["chartPosition"] = PI > aLine + 0.5 ? "A-line above" : PI < aLine - 0.5 ? "A-line below" : "on A-line";

  // USCS ince dane grubu
  let uscsGroup: string;
  if (LL < 50) {
    uscsGroup = PI > aLine ? "CL (Düşük plastisiteli kil)" : "ML (Düşük plastisiteli silt)";
  } else {
    uscsGroup = PI > aLine ? "CH (Yüksek plastisiteli kil)" : "MH (Yüksek plastisiteli silt)";
  }
  if (PI < 4 || (PI >= 4 && PI <= 7 && Math.abs(PI - aLine) < 2)) {
    uscsGroup = LL < 50 ? "CL-ML (Siltli kil)" : uscsGroup;
  }

  let LI: number | undefined;
  let CI: number | undefined;
  let consistencyState: string | undefined;
  if (w !== undefined && PI > 0) {
    LI = r((w - PL) / PI, 2);
    CI = r((LL - w) / PI, 2);
    if (LI < 0) consistencyState = "Yarı katı / Katı";
    else if (LI < 0.25) consistencyState = "Katı";
    else if (LI < 0.5) consistencyState = "Orta katı";
    else if (LI < 0.75) consistencyState = "Yumuşak";
    else if (LI < 1) consistencyState = "Çok yumuşak";
    else consistencyState = "Akıcı";
  }

  const activity = clayPercent && clayPercent > 0 ? r(PI / clayPercent, 2) : undefined;

  return { PI, LI, CI, activity, chartPosition, uscsGroup, consistencyState };
}

// ─── Dane Dağılımı ───

export interface GrainSizePoint {
  /** Elek açıklığı (mm) */
  sieveSize: number;
  /** Geçen yüzde (%) */
  percentPassing: number;
}

export interface GrainSizeInput {
  /** Elek analizi verileri (büyükten küçüğe sıralı) */
  data: GrainSizePoint[];
}

export interface GrainSizeResult {
  /** D10 (mm) — efektif dane çapı */
  D10: number | null;
  /** D30 (mm) */
  D30: number | null;
  /** D50 (mm) — medyan dane çapı */
  D50: number | null;
  /** D60 (mm) */
  D60: number | null;
  /** Üniformluk katsayısı Cu = D60/D10 */
  Cu: number | null;
  /** Derecelenme katsayısı Cc = D30²/(D10×D60) */
  Cc: number | null;
  /** İyi derecelenmiş mi? */
  wellGraded: boolean;
  /** Dane fraksiyonları (%) */
  fractions: { gravel: number; sand: number; silt: number; clay: number };
  /** Derecelenme tanımı */
  gradingDescription: string;
}

export function grainSizeAnalysis(input: GrainSizeInput): GrainSizeResult {
  const { data } = input;
  if (data.length < 2) {
    return { D10: null, D30: null, D50: null, D60: null, Cu: null, Cc: null, wellGraded: false, fractions: { gravel: 0, sand: 0, silt: 0, clay: 0 }, gradingDescription: "Yetersiz veri" };
  }

  // Sıralama (büyükten küçüğe elek, küçükten büyüğe geçen %)
  const sorted = [...data].sort((a, b) => a.sieveSize - b.sieveSize);

  function interpolateD(percent: number): number | null {
    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i], p2 = sorted[i + 1];
      if ((p1.percentPassing <= percent && p2.percentPassing >= percent) ||
          (p1.percentPassing >= percent && p2.percentPassing <= percent)) {
        // Log interpolasyon
        const s1 = Math.log10(Math.max(p1.sieveSize, 0.0001));
        const s2 = Math.log10(Math.max(p2.sieveSize, 0.0001));
        const range = p2.percentPassing - p1.percentPassing;
        if (Math.abs(range) < 0.001) return p1.sieveSize;
        const t = (percent - p1.percentPassing) / range;
        return r(Math.pow(10, s1 + t * (s2 - s1)), 4);
      }
    }
    return null;
  }

  const D10 = interpolateD(10);
  const D30 = interpolateD(30);
  const D50 = interpolateD(50);
  const D60 = interpolateD(60);

  const Cu = D10 && D60 && D10 > 0 ? r(D60 / D10, 1) : null;
  const Cc = D10 && D30 && D60 && D10 > 0 && D60 > 0 ? r((D30 * D30) / (D10 * D60), 2) : null;

  // Fraksiyonlar (ASTM sınırları)
  function getPassingAt(size: number): number {
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].sieveSize <= size && sorted[i + 1].sieveSize >= size) {
        const range = sorted[i + 1].sieveSize - sorted[i].sieveSize;
        if (range < 0.0001) return sorted[i].percentPassing;
        const t = (size - sorted[i].sieveSize) / range;
        return sorted[i].percentPassing + t * (sorted[i + 1].percentPassing - sorted[i].percentPassing);
      }
    }
    if (size <= sorted[0].sieveSize) return sorted[0].percentPassing;
    return sorted[sorted.length - 1].percentPassing;
  }

  const pass4_75 = getPassingAt(4.75);   // No.4 elek
  const pass0_075 = getPassingAt(0.075); // No.200 elek
  const pass0_002 = getPassingAt(0.002); // Kil sınırı

  const gravel = r(100 - pass4_75, 1);
  const sand = r(pass4_75 - pass0_075, 1);
  const fines = r(pass0_075, 1);
  const clay = r(Math.max(0, pass0_002), 1);
  const silt = r(Math.max(0, fines - clay), 1);

  // İyi derecelenme kontrolü
  let wellGraded = false;
  let gradingDescription = "Kötü derecelenmiş (üniform)";
  if (Cu !== null && Cc !== null) {
    if (gravel > sand) {
      wellGraded = Cu >= 4 && Cc >= 1 && Cc <= 3;
    } else {
      wellGraded = Cu >= 6 && Cc >= 1 && Cc <= 3;
    }
    gradingDescription = wellGraded ? "İyi derecelenmiş" : Cu !== null && Cu < 4 ? "Kötü derecelenmiş (üniform)" : "Kötü derecelenmiş (boşluklu)";
  }

  return {
    D10, D30, D50, D60, Cu, Cc, wellGraded,
    fractions: { gravel: Math.max(gravel, 0), sand: Math.max(sand, 0), silt: Math.max(silt, 0), clay: Math.max(clay, 0) },
    gradingDescription,
  };
}

function r(v: number, d = 2) { return Math.round(v * 10 ** d) / 10 ** d; }
