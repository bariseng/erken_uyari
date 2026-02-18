/**
 * GeoForce Engine — Zemin Özellik Tahmini Veritabanı
 * USCS sınıfı + SPT N değerinden zemin parametresi tahmini
 * Kaya için RMR / UCS bazlı tablo
 */

export interface SoilPropertyEstimateInput {
  /** USCS zemin sınıfı */
  uscsClass: string;
  /** SPT N değeri (düzeltilmiş) — opsiyonel */
  sptN?: number;
}

export interface SoilPropertyEstimateResult {
  method: string;
  /** USCS sınıfı */
  uscsClass: string;
  /** Birim hacim ağırlık γ (kN/m³) */
  gamma: { min: number; max: number; estimated: number };
  /** İçsel sürtünme açısı φ (derece) */
  frictionAngle: { min: number; max: number; estimated: number };
  /** Drenajsız kayma dayanımı cu (kPa) */
  cohesion: { min: number; max: number; estimated: number };
  /** Elastisite modülü E (MPa) */
  modulus: { min: number; max: number; estimated: number };
  /** Açıklama */
  description: string;
}

export interface RockPropertyEstimateInput {
  /** Kaya Kütle Sınıflandırması RMR */
  RMR?: number;
  /** Tek eksenli basınç dayanımı UCS (MPa) */
  UCS?: number;
}

export interface RockPropertyEstimateResult {
  method: string;
  /** Kaya sınıfı */
  rockClass: string;
  /** Kohezyon c (kPa) */
  cohesion: { min: number; max: number; estimated: number };
  /** Sürtünme açısı φ (derece) */
  frictionAngle: { min: number; max: number; estimated: number };
  /** Deformasyon modülü Em (GPa) */
  modulus: { min: number; max: number; estimated: number };
  /** Açıklama */
  description: string;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ─── USCS Zemin Parametre Tablosu ───
interface SoilRecord {
  gamma: [number, number];
  phi: [number, number];
  cu: [number, number];
  E: [number, number];
  desc: string;
}

const soilDB: Record<string, SoilRecord> = {
  GW: { gamma: [19, 22], phi: [33, 40], cu: [0, 0], E: [50, 200], desc: "İyi derecelenmiş çakıl" },
  GP: { gamma: [18, 21], phi: [30, 36], cu: [0, 0], E: [40, 150], desc: "Kötü derecelenmiş çakıl" },
  GM: { gamma: [18, 21], phi: [28, 34], cu: [0, 10], E: [30, 120], desc: "Siltli çakıl" },
  GC: { gamma: [18, 21], phi: [25, 32], cu: [5, 20], E: [25, 100], desc: "Killi çakıl" },
  SW: { gamma: [17, 21], phi: [30, 38], cu: [0, 0], E: [30, 100], desc: "İyi derecelenmiş kum" },
  SP: { gamma: [16, 20], phi: [27, 34], cu: [0, 0], E: [20, 80], desc: "Kötü derecelenmiş kum" },
  SM: { gamma: [16, 20], phi: [25, 32], cu: [0, 10], E: [15, 60], desc: "Siltli kum" },
  SC: { gamma: [16, 20], phi: [22, 30], cu: [5, 25], E: [10, 50], desc: "Killi kum" },
  ML: { gamma: [15, 19], phi: [20, 30], cu: [10, 40], E: [5, 30], desc: "Düşük plastisiteli silt" },
  CL: { gamma: [16, 20], phi: [15, 25], cu: [20, 100], E: [5, 25], desc: "Düşük plastisiteli kil" },
  OL: { gamma: [14, 18], phi: [15, 25], cu: [10, 50], E: [3, 15], desc: "Düşük plastisiteli organik zemin" },
  MH: { gamma: [14, 18], phi: [15, 25], cu: [10, 50], E: [3, 20], desc: "Yüksek plastisiteli silt" },
  CH: { gamma: [14, 19], phi: [10, 20], cu: [25, 200], E: [2, 15], desc: "Yüksek plastisiteli kil" },
  OH: { gamma: [12, 17], phi: [10, 20], cu: [10, 80], E: [1, 10], desc: "Yüksek plastisiteli organik zemin" },
  Pt: { gamma: [10, 14], phi: [5, 15], cu: [5, 30], E: [0.5, 5], desc: "Turba ve yüksek organik zemin" },
};

/**
 * USCS sınıfı + SPT N değerinden zemin parametresi tahmini
 */
export function estimateSoilProperties(input: SoilPropertyEstimateInput): SoilPropertyEstimateResult {
  const { uscsClass, sptN } = input;

  const record = soilDB[uscsClass.toUpperCase()];
  if (!record) {
    // Bilinmeyen sınıf — CL varsayımı
    const fallback = soilDB["CL"];
    return buildResult("CL", fallback, sptN, `Bilinmeyen sınıf "${uscsClass}" — CL varsayıldı`);
  }

  return buildResult(uscsClass.toUpperCase(), record, sptN, record.desc);
}

function buildResult(cls: string, rec: SoilRecord, sptN: number | undefined, desc: string): SoilPropertyEstimateResult {
  // SPT ile daraltma: N değeri aralık içinde interpolasyon sağlar
  let ratio = 0.5; // varsayılan orta değer
  if (sptN !== undefined) {
    // Granüler zeminler: N=0→min, N=50→max
    // Kohezyonlu zeminler: N=0→min, N=30→max
    const isGranular = ["GW", "GP", "GM", "GC", "SW", "SP", "SM", "SC"].includes(cls);
    const nMax = isGranular ? 50 : 30;
    ratio = Math.min(Math.max(sptN / nMax, 0), 1);
  }

  const interp = (range: [number, number]) => round(range[0] + ratio * (range[1] - range[0]), 1);

  return {
    method: "USCS + SPT Korelasyonu — Zemin Parametre Tahmini",
    uscsClass: cls,
    gamma: { min: rec.gamma[0], max: rec.gamma[1], estimated: interp(rec.gamma) },
    frictionAngle: { min: rec.phi[0], max: rec.phi[1], estimated: interp(rec.phi) },
    cohesion: { min: rec.cu[0], max: rec.cu[1], estimated: interp(rec.cu) },
    modulus: { min: rec.E[0], max: rec.E[1], estimated: interp(rec.E) },
    description: desc,
  };
}

// ─── Kaya Parametre Tahmini (RMR / UCS bazlı) ───

interface RockRecord {
  cls: string;
  c: [number, number];
  phi: [number, number];
  Em: [number, number];
  desc: string;
}

// Bieniawski (1989) RMR sınıflandırması
const rockDB: RockRecord[] = [
  { cls: "I", c: [400, 1000], phi: [45, 60], Em: [50, 100], desc: "Çok iyi kaya (RMR 81-100)" },
  { cls: "II", c: [300, 400], phi: [35, 45], Em: [30, 50], desc: "İyi kaya (RMR 61-80)" },
  { cls: "III", c: [200, 300], phi: [25, 35], Em: [10, 30], desc: "Orta kaya (RMR 41-60)" },
  { cls: "IV", c: [100, 200], phi: [15, 25], Em: [3, 10], desc: "Zayıf kaya (RMR 21-40)" },
  { cls: "V", c: [10, 100], phi: [5, 15], Em: [0.5, 3], desc: "Çok zayıf kaya (RMR < 21)" },
];

/**
 * Kaya parametre tahmini — RMR ve/veya UCS bazlı
 * Bieniawski (1989) sınıflandırması
 */
export function estimateRockProperties(input: RockPropertyEstimateInput): RockPropertyEstimateResult {
  const { RMR, UCS } = input;

  let record: RockRecord;

  if (RMR !== undefined) {
    if (RMR > 80) record = rockDB[0];
    else if (RMR > 60) record = rockDB[1];
    else if (RMR > 40) record = rockDB[2];
    else if (RMR > 20) record = rockDB[3];
    else record = rockDB[4];

    // RMR ile interpolasyon (sınıf içi)
    const classMin = record === rockDB[0] ? 81 : record === rockDB[1] ? 61 : record === rockDB[2] ? 41 : record === rockDB[3] ? 21 : 0;
    const classMax = record === rockDB[0] ? 100 : record === rockDB[1] ? 80 : record === rockDB[2] ? 60 : record === rockDB[3] ? 40 : 20;
    const ratio = Math.min(Math.max((RMR - classMin) / (classMax - classMin), 0), 1);

    const interp = (range: [number, number]) => round(range[0] + ratio * (range[1] - range[0]), 1);

    // Deformasyon modülü — Bieniawski (1978): Em = 2*RMR - 100 (RMR>50)
    let EmEst: number;
    if (RMR > 50) {
      EmEst = 2 * RMR - 100;
    } else {
      EmEst = interp(record.Em);
    }

    return {
      method: "Bieniawski (1989) — RMR Bazlı Kaya Parametre Tahmini",
      rockClass: `Sınıf ${record.cls}`,
      cohesion: { min: record.c[0], max: record.c[1], estimated: interp(record.c) },
      frictionAngle: { min: record.phi[0], max: record.phi[1], estimated: interp(record.phi) },
      modulus: { min: record.Em[0], max: record.Em[1], estimated: round(EmEst, 1) },
      description: record.desc,
    };
  }

  if (UCS !== undefined) {
    // UCS bazlı sınıflandırma (ISRM)
    let desc: string, cls: string;
    let c: [number, number], phi: [number, number], Em: [number, number];

    if (UCS > 100) {
      cls = "R5-R6"; desc = "Çok sağlam — sağlam kaya"; c = [500, 1000]; phi = [40, 55]; Em = [30, 80];
    } else if (UCS > 50) {
      cls = "R4"; desc = "Sağlam kaya"; c = [300, 500]; phi = [35, 45]; Em = [15, 40];
    } else if (UCS > 25) {
      cls = "R3"; desc = "Orta sağlam kaya"; c = [150, 300]; phi = [25, 35]; Em = [5, 20];
    } else if (UCS > 5) {
      cls = "R2"; desc = "Zayıf kaya"; c = [50, 150]; phi = [15, 25]; Em = [1, 8];
    } else {
      cls = "R1"; desc = "Çok zayıf kaya"; c = [10, 50]; phi = [5, 15]; Em = [0.3, 2];
    }

    const mid = (range: [number, number]) => round((range[0] + range[1]) / 2, 1);

    return {
      method: "ISRM — UCS Bazlı Kaya Parametre Tahmini",
      rockClass: cls!,
      cohesion: { min: c![0], max: c![1], estimated: mid(c!) },
      frictionAngle: { min: phi![0], max: phi![1], estimated: mid(phi!) },
      modulus: { min: Em![0], max: Em![1], estimated: mid(Em!) },
      description: desc!,
    };
  }

  // Hiçbir girdi yoksa varsayılan
  const def = rockDB[2];
  const mid = (range: [number, number]) => round((range[0] + range[1]) / 2, 1);
  return {
    method: "Varsayılan — Orta Kaya Parametreleri",
    rockClass: "Sınıf III",
    cohesion: { min: def.c[0], max: def.c[1], estimated: mid(def.c) },
    frictionAngle: { min: def.phi[0], max: def.phi[1], estimated: mid(def.phi) },
    modulus: { min: def.Em[0], max: def.Em[1], estimated: mid(def.Em) },
    description: "RMR veya UCS girilmedi — orta kaya varsayıldı",
  };
}
