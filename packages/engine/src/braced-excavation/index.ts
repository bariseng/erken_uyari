/**
 * GeoForce Engine — Destekli (Braced) Kazı Analizi
 * Peck (1969) apparent earth pressure diyagramları, destek kuvvetleri, taban kabarması
 */

export interface BracedExcavationInput {
  /** Kazı derinliği H (m) */
  excavationDepth: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Drenajsız kayma dayanımı cu (kPa) — kil için, 0 ise kum */
  cohesion: number;
  /** İçsel sürtünme açısı φ (derece) — kum için */
  frictionAngle: number;
  /** Destek (strut) seviyeleri — üstten derinlik (m) */
  strutLevels: number[];
  /** Destek yatay aralığı (m) */
  strutSpacing: number;
  /** Yüzey sürşarjı q (kPa) — varsayılan 0 */
  surcharge?: number;
}

export interface BracedExcavationResult {
  method: string;
  /** Zemin tipi sınıflandırması */
  soilCategory: string;
  /** Görünür toprak basıncı pa (kPa) */
  apparentPressure: number;
  /** Destek kuvvetleri (kN/m) — her strut için */
  strutForces: { level: number; force: number }[];
  /** Taban kabarması güvenlik sayısı */
  baseHeaveFS: number;
  /** Basınç diyagramı noktaları */
  pressureDiagram: { depth: number; pressure: number }[];
  /** Stabilite değerlendirmesi */
  stability: string;
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const toRad = (d: number) => (d * Math.PI) / 180;

/**
 * Peck (1969) Destekli Kazı Analizi
 * Apparent earth pressure + tributary area yöntemi
 */
export function bracedExcavation(input: BracedExcavationInput): BracedExcavationResult {
  const { excavationDepth: H, gamma, cohesion: cu, frictionAngle: phi, strutLevels, strutSpacing, surcharge: q = 0 } = input;

  let pa: number;
  let soilCategory: string;
  const diagram: BracedExcavationResult["pressureDiagram"] = [];

  const isSand = cu === 0 || (phi > 0 && cu === 0);

  if (isSand || (cu === 0 && phi > 0)) {
    // ─── Kum: pa = 0.65 * Ka * γ * H ───
    const Ka = Math.pow(Math.tan(Math.PI / 4 - toRad(phi) / 2), 2);
    pa = 0.65 * Ka * gamma * H;
    soilCategory = `Kum (φ=${phi}°, Ka=${round(Ka, 3)})`;

    // Dikdörtgen diyagram
    for (let d = 0; d <= H; d += H / 20) {
      diagram.push({ depth: round(d, 2), pressure: round(pa, 2) });
    }
  } else {
    // ─── Kil ───
    const stabilityNumber = (gamma * H) / cu;

    if (stabilityNumber > 4) {
      // Yumuşak-orta kil: pa = γH(1 - 4cu/(γH)) veya min 0.3γH
      pa = gamma * H * (1 - (4 * cu) / (gamma * H));
      pa = Math.max(pa, 0.3 * gamma * H);
      soilCategory = `Yumuşak-Orta Kil (cu=${cu} kPa, N=${round(stabilityNumber, 1)})`;

      // Dikdörtgen diyagram (üst 0.25H ve alt 0.25H sıfır, ortada pa)
      const h25 = 0.25 * H;
      for (let d = 0; d <= H; d += H / 20) {
        if (d <= h25) {
          diagram.push({ depth: round(d, 2), pressure: round((d / h25) * pa, 2) });
        } else if (d >= H - h25) {
          diagram.push({ depth: round(d, 2), pressure: round(((H - d) / h25) * pa, 2) });
        } else {
          diagram.push({ depth: round(d, 2), pressure: round(pa, 2) });
        }
      }
    } else {
      // Sert kil: pa = 0.2γH ~ 0.4γH
      pa = 0.3 * gamma * H; // ortalama
      soilCategory = `Sert Kil (cu=${cu} kPa, N=${round(stabilityNumber, 1)})`;

      // Trapez diyagram
      const h25 = 0.25 * H;
      for (let d = 0; d <= H; d += H / 20) {
        if (d <= h25) {
          diagram.push({ depth: round(d, 2), pressure: round((d / h25) * pa, 2) });
        } else if (d >= 0.75 * H) {
          diagram.push({ depth: round(d, 2), pressure: round(((H - d) / h25) * pa, 2) });
        } else {
          diagram.push({ depth: round(d, 2), pressure: round(pa, 2) });
        }
      }
    }
  }

  // ─── Destek kuvvetleri — Tributary Area yöntemi ───
  const sortedLevels = [...strutLevels].sort((a, b) => a - b);
  const strutForces: BracedExcavationResult["strutForces"] = [];

  for (let i = 0; i < sortedLevels.length; i++) {
    const level = sortedLevels[i];
    // Tributary alan: üst sınır ile alt sınır arası
    const upperBound = i === 0 ? 0 : (sortedLevels[i - 1] + level) / 2;
    const lowerBound = i === sortedLevels.length - 1 ? H : (level + sortedLevels[i + 1]) / 2;
    const tributaryHeight = lowerBound - upperBound;

    // Kuvvet = pa × tributary yükseklik × strut aralığı
    const force = pa * tributaryHeight * strutSpacing;

    strutForces.push({ level: round(level, 2), force: round(force, 1) });
  }

  // ─── Taban kabarması güvenliği ───
  // FS = Nc * cu / (γ * H + q)
  // Nc ≈ 5.7 (şerit temel, Skempton)
  const Nc = 5.7;
  const baseHeaveFS = cu > 0 ? (Nc * cu) / (gamma * H + q) : 999;

  // Stabilite değerlendirmesi
  let stability: string;
  if (baseHeaveFS >= 2.0) stability = "Güvenli — taban kabarması riski düşük";
  else if (baseHeaveFS >= 1.5) stability = "Kabul edilebilir — izleme gerekli";
  else if (baseHeaveFS >= 1.0) stability = "Kritik — ek önlem gerekli (jet-grout, derin duvar vb.)";
  else stability = "Yetersiz — taban kabarması beklenir, tasarım revize edilmeli";

  return {
    method: "Peck (1969) — Destekli Kazı Analizi",
    soilCategory,
    apparentPressure: round(pa, 2),
    strutForces,
    baseHeaveFS: round(baseHeaveFS, 2),
    pressureDiagram: diagram,
    stability,
  };
}
