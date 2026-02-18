/**
 * GeoForce Engine — TBDY 2018 Zemin Sınıfı Belirleme
 * Türkiye Bina Deprem Yönetmeliği 2018, Bölüm 16.4
 */

export type TBDY2018SoilClass = "ZA" | "ZB" | "ZC" | "ZD" | "ZE" | "ZF";

export interface TBDY2018ClassInput {
  /** Vs30 — üst 30m ortalama kayma dalgası hızı (m/s) */
  vs30?: number;
  /** N60 — üst 30m ortalama SPT darbe sayısı (düzeltilmiş) */
  n60?: number;
  /** cu — üst 30m ortalama drenajsız kayma dayanımı (kPa) */
  cu?: number;
}

export interface TBDY2018ClassResult {
  soilClass: TBDY2018SoilClass;
  name: string;
  nameTR: string;
  description: string;
  descriptionTR: string;
  method: "Vs30" | "N60" | "cu";
}

export function classifyTBDY2018(input: TBDY2018ClassInput): TBDY2018ClassResult {
  // Priority: Vs30 > N60 > cu
  if (input.vs30 !== undefined) {
    return classifyByVs30(input.vs30);
  }
  if (input.n60 !== undefined) {
    return classifyByN60(input.n60);
  }
  if (input.cu !== undefined) {
    return classifyByCu(input.cu);
  }
  throw new Error("En az bir parametre gerekli: vs30, n60 veya cu");
}

function classifyByVs30(vs30: number): TBDY2018ClassResult {
  if (vs30 > 1500) {
    return {
      soilClass: "ZA", method: "Vs30",
      name: "Hard Rock", nameTR: "Sağlam Kaya",
      description: "Vs30 > 1500 m/s", descriptionTR: "Vs30 > 1500 m/s — Sağlam, sert kayalar",
    };
  }
  if (vs30 > 760) {
    return {
      soilClass: "ZB", method: "Vs30",
      name: "Rock", nameTR: "Kaya",
      description: "760 < Vs30 ≤ 1500 m/s", descriptionTR: "760 < Vs30 ≤ 1500 m/s — Az ayrışmış, orta sağlam kayalar",
    };
  }
  if (vs30 > 360) {
    return {
      soilClass: "ZC", method: "Vs30",
      name: "Dense Soil / Soft Rock", nameTR: "Sıkı Zemin / Yumuşak Kaya",
      description: "360 < Vs30 ≤ 760 m/s", descriptionTR: "360 < Vs30 ≤ 760 m/s — Çok sıkı kum, çakıl veya sert kil",
    };
  }
  if (vs30 > 180) {
    return {
      soilClass: "ZD", method: "Vs30",
      name: "Medium Dense Soil", nameTR: "Orta Sıkı Zemin",
      description: "180 < Vs30 ≤ 360 m/s", descriptionTR: "180 < Vs30 ≤ 360 m/s — Orta sıkı-sıkı kum, çakıl veya katı kil",
    };
  }
  return {
    soilClass: "ZE", method: "Vs30",
    name: "Soft Soil", nameTR: "Yumuşak Zemin",
    description: "Vs30 ≤ 180 m/s", descriptionTR: "Vs30 ≤ 180 m/s — Gevşek kum, yumuşak kil, dolgu",
  };
}

function classifyByN60(n60: number): TBDY2018ClassResult {
  if (n60 > 50) {
    return {
      soilClass: "ZC", method: "N60",
      name: "Dense Soil / Soft Rock", nameTR: "Sıkı Zemin / Yumuşak Kaya",
      description: "N60 > 50", descriptionTR: "N60 > 50 — Çok sıkı kum, çakıl veya sert kil",
    };
  }
  if (n60 > 15) {
    return {
      soilClass: "ZD", method: "N60",
      name: "Medium Dense Soil", nameTR: "Orta Sıkı Zemin",
      description: "15 < N60 ≤ 50", descriptionTR: "15 < N60 ≤ 50 — Orta sıkı-sıkı kum veya katı kil",
    };
  }
  return {
    soilClass: "ZE", method: "N60",
    name: "Soft Soil", nameTR: "Yumuşak Zemin",
    description: "N60 ≤ 15", descriptionTR: "N60 ≤ 15 — Gevşek kum, yumuşak kil",
  };
}

function classifyByCu(cu: number): TBDY2018ClassResult {
  if (cu > 250) {
    return {
      soilClass: "ZC", method: "cu",
      name: "Dense Soil / Soft Rock", nameTR: "Sıkı Zemin / Yumuşak Kaya",
      description: "cu > 250 kPa", descriptionTR: "cu > 250 kPa — Sert kil, yumuşak kaya",
    };
  }
  if (cu > 70) {
    return {
      soilClass: "ZD", method: "cu",
      name: "Medium Dense Soil", nameTR: "Orta Sıkı Zemin",
      description: "70 < cu ≤ 250 kPa", descriptionTR: "70 < cu ≤ 250 kPa — Katı-çok katı kil",
    };
  }
  return {
    soilClass: "ZE", method: "cu",
    name: "Soft Soil", nameTR: "Yumuşak Zemin",
    description: "cu ≤ 70 kPa", descriptionTR: "cu ≤ 70 kPa — Yumuşak-orta katı kil",
  };
}
