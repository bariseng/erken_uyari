/**
 * GeoForce Engine — TBDY 2018 Deprem Parametreleri
 * Türkiye Bina Deprem Yönetmeliği 2018, Bölüm 2
 */

import type { TBDY2018SoilClass } from "../classification/tbdy2018";

export type EarthquakeLevel = "DD1" | "DD2" | "DD3" | "DD4";

export interface SeismicInput {
  /** Kısa periyot harita spektral ivme katsayısı Ss */
  Ss: number;
  /** 1s periyot harita spektral ivme katsayısı S1 */
  S1: number;
  /** Zemin sınıfı */
  soilClass: TBDY2018SoilClass;
  /** Bina önem katsayısı I — varsayılan 1.0 */
  importanceFactor?: number;
  /** Taşıyıcı sistem davranış katsayısı R — varsayılan 4.0 */
  R?: number;
  /** Dayanım fazlalığı katsayısı D — varsayılan 2.5 */
  D?: number;
}

export interface DesignSpectrum {
  /** Periyot değerleri T (s) */
  periods: number[];
  /** Elastik spektral ivme Sae(T) (g) */
  elasticSa: number[];
  /** Azaltılmış spektral ivme Sar(T) (g) */
  reducedSa: number[];
}

export interface SeismicResult {
  /** Kısa periyot tasarım spektral ivme katsayısı SDS */
  SDS: number;
  /** 1s periyot tasarım spektral ivme katsayısı SD1 */
  SD1: number;
  /** Yerel zemin etki katsayısı Fs */
  Fs: number;
  /** Yerel zemin etki katsayısı F1 */
  F1: number;
  /** Köşe periyotları */
  TA: number;
  TB: number;
  TL: number;
  /** Deprem tasarım sınıfı (DTS) */
  DTS: number;
  /** Tasarım spektrumu */
  spectrum: DesignSpectrum;
}

// ─── Yerel Zemin Etki Katsayıları (TBDY 2018 Tablo 2.1 ve 2.2) ───

function getFs(soilClass: TBDY2018SoilClass, Ss: number): number {
  const table: Record<TBDY2018SoilClass, number[]> = {
    ZA: [0.8, 0.8, 0.8, 0.8, 0.8],
    ZB: [0.9, 0.9, 0.9, 0.9, 0.9],
    ZC: [1.3, 1.3, 1.2, 1.2, 1.2],
    ZD: [1.6, 1.4, 1.2, 1.1, 1.0],
    ZE: [2.4, 1.7, 1.3, 1.1, 0.9],
    ZF: [1.0, 1.0, 1.0, 1.0, 1.0], // Özel analiz gerekir
  };
  const ssValues = [0.25, 0.50, 0.75, 1.00, 1.50];
  return interpolateTable(table[soilClass], ssValues, Ss);
}

function getF1(soilClass: TBDY2018SoilClass, S1: number): number {
  const table: Record<TBDY2018SoilClass, number[]> = {
    ZA: [0.8, 0.8, 0.8, 0.8, 0.8],
    ZB: [0.8, 0.8, 0.8, 0.8, 0.8],
    ZC: [1.5, 1.5, 1.5, 1.5, 1.5],
    ZD: [2.4, 2.2, 2.0, 1.9, 1.8],
    ZE: [4.2, 3.3, 2.8, 2.4, 2.2],
    ZF: [1.0, 1.0, 1.0, 1.0, 1.0],
  };
  const s1Values = [0.10, 0.20, 0.30, 0.40, 0.50];
  return interpolateTable(table[soilClass], s1Values, S1);
}

function interpolateTable(values: number[], keys: number[], x: number): number {
  if (x <= keys[0]) return values[0];
  if (x >= keys[keys.length - 1]) return values[values.length - 1];

  for (let i = 0; i < keys.length - 1; i++) {
    if (x >= keys[i] && x <= keys[i + 1]) {
      const t = (x - keys[i]) / (keys[i + 1] - keys[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return values[values.length - 1];
}

// ─── Tasarım Spektrumu ───

function buildSpectrum(SDS: number, SD1: number, TA: number, TB: number, TL: number, R: number, D: number, I: number): DesignSpectrum {
  const periods: number[] = [];
  const elasticSa: number[] = [];
  const reducedSa: number[] = [];

  // Generate periods: 0 to 6s
  const pts = [
    0, 0.01, 0.02, 0.03, 0.05, 0.075, 0.1, 0.15, 0.2,
    TA * 0.5, TA, TB,
    0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0,
  ];
  // Unique + sorted
  const uniquePts = [...new Set(pts.filter(p => p > 0 && p <= 6))].sort((a, b) => a - b);
  // Add 0
  uniquePts.unshift(0);

  const Ra = R / I; // Deprem yükü azaltma katsayısı

  for (const T of uniquePts) {
    periods.push(round(T, 4));

    let Sae: number;
    if (T === 0) {
      Sae = SDS * 0.4; // PGA ≈ 0.4 * SDS
    } else if (T < TA) {
      Sae = (0.4 + 0.6 * (T / TA)) * SDS;
    } else if (T <= TB) {
      Sae = SDS;
    } else if (T <= TL) {
      Sae = SD1 / T;
    } else {
      Sae = SD1 * TL / (T * T);
    }

    // Azaltılmış spektral ivme
    let Sar: number;
    if (T === 0) {
      Sar = Sae;
    } else {
      const RaT = T <= TB ? D + (Ra / I - D) * (T / TB) : Ra / I;
      Sar = Sae / Math.max(RaT, 1);
    }

    elasticSa.push(round(Sae, 4));
    reducedSa.push(round(Sar, 4));
  }

  return { periods, elasticSa, reducedSa };
}

// ─── DTS Belirleme ───

function getDTS(SDS: number): number {
  if (SDS < 0.33) return 1;
  if (SDS < 0.50) return 2;
  if (SDS < 0.75) return 3;
  return 4;
}

// ─── Ana Fonksiyon ───

export function calculateSeismicParams(input: SeismicInput): SeismicResult {
  const { Ss, S1, soilClass, importanceFactor: I = 1.0, R = 4.0, D = 2.5 } = input;

  const Fs = getFs(soilClass, Ss);
  const F1 = getF1(soilClass, S1);

  const SDS = round(Ss * Fs, 4);
  const SD1 = round(S1 * F1, 4);

  const TA = round(0.2 * SD1 / SDS, 4);
  const TB = round(SD1 / SDS, 4);
  const TL = 6; // TBDY 2018 sabit

  const DTS = getDTS(SDS);

  const spectrum = buildSpectrum(SDS, SD1, TA, TB, TL, R, D, I);

  return { SDS, SD1, Fs: round(Fs, 3), F1: round(F1, 3), TA, TB, TL, DTS, spectrum };
}

function round(v: number, d = 2): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}
