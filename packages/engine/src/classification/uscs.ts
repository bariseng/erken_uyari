/**
 * GeoForce Engine — USCS Zemin Sınıflandırma
 * ASTM D2487 standardına göre Birleşik Zemin Sınıflandırma Sistemi
 */

export interface GrainSizeData {
  /** % passing #200 sieve (0.075mm) */
  fines: number;
  /** % passing #4 sieve (4.75mm) */
  passing4: number;
  /** % passing #40 sieve (0.425mm) — for sand/gravel boundary within fines */
  passing40?: number;
  /** D10 (mm) — effective size */
  d10?: number;
  /** D30 (mm) */
  d30?: number;
  /** D60 (mm) */
  d60?: number;
}

export interface AtterbergLimits {
  /** Liquid Limit (%) */
  liquidLimit: number;
  /** Plastic Limit (%) */
  plasticLimit: number;
}

export interface USCSInput {
  grainSize: GrainSizeData;
  atterberg?: AtterbergLimits;
  /** Organic content flag */
  isOrganic?: boolean;
}

export interface USCSResult {
  /** USCS symbol (e.g., "GW", "CL", "SM") */
  symbol: string;
  /** Full name in English */
  name: string;
  /** Full name in Turkish */
  nameTR: string;
  /** Plasticity Index */
  plasticityIndex?: number;
  /** Coefficient of Uniformity */
  cu?: number;
  /** Coefficient of Curvature */
  cc?: number;
  /** Description */
  description: string;
  descriptionTR: string;
}

function calcCu(d60: number, d10: number): number {
  if (d10 <= 0) return 0;
  return d60 / d10;
}

function calcCc(d30: number, d60: number, d10: number): number {
  if (d60 * d10 <= 0) return 0;
  return (d30 * d30) / (d60 * d10);
}

function classifyFineGrained(ll: number, pi: number, isOrganic: boolean): USCSResult {
  // A-line: PI = 0.73 * (LL - 20)
  const aLine = 0.73 * (ll - 20);
  const aboveALine = pi > aLine;

  if (isOrganic) {
    if (ll < 50) {
      return {
        symbol: "OL",
        name: "Organic Clay/Silt (Low Plasticity)",
        nameTR: "Organik Kil/Silt (Düşük Plastisiteli)",
        plasticityIndex: pi,
        description: "Organic fine-grained soil with LL < 50",
        descriptionTR: "Likit limiti 50'den küçük organik ince daneli zemin",
      };
    }
    return {
      symbol: "OH",
      name: "Organic Clay/Silt (High Plasticity)",
      nameTR: "Organik Kil/Silt (Yüksek Plastisiteli)",
      plasticityIndex: pi,
      description: "Organic fine-grained soil with LL ≥ 50",
      descriptionTR: "Likit limiti 50 ve üzeri organik ince daneli zemin",
    };
  }

  if (ll < 50) {
    if (aboveALine && pi > 7) {
      return {
        symbol: "CL",
        name: "Lean Clay (Low Plasticity)",
        nameTR: "Yağsız Kil (Düşük Plastisiteli)",
        plasticityIndex: pi,
        description: "Inorganic clay of low to medium plasticity",
        descriptionTR: "Düşük-orta plastisiteli inorganik kil",
      };
    }
    if (!aboveALine || pi < 4) {
      return {
        symbol: "ML",
        name: "Silt (Low Plasticity)",
        nameTR: "Silt (Düşük Plastisiteli)",
        plasticityIndex: pi,
        description: "Inorganic silt of low plasticity",
        descriptionTR: "Düşük plastisiteli inorganik silt",
      };
    }
    // Hatching zone (4 ≤ PI ≤ 7 and near A-line)
    return {
      symbol: "CL-ML",
      name: "Silty Clay (Low Plasticity)",
      nameTR: "Siltli Kil (Düşük Plastisiteli)",
      plasticityIndex: pi,
      description: "Silty clay, borderline between CL and ML",
      descriptionTR: "CL ve ML sınırında siltli kil",
    };
  }

  // LL >= 50
  if (aboveALine) {
    return {
      symbol: "CH",
      name: "Fat Clay (High Plasticity)",
      nameTR: "Yağlı Kil (Yüksek Plastisiteli)",
      plasticityIndex: pi,
      description: "Inorganic clay of high plasticity",
      descriptionTR: "Yüksek plastisiteli inorganik kil",
    };
  }
  return {
    symbol: "MH",
    name: "Elastic Silt (High Plasticity)",
    nameTR: "Elastik Silt (Yüksek Plastisiteli)",
    plasticityIndex: pi,
    description: "Inorganic silt of high plasticity",
    descriptionTR: "Yüksek plastisiteli inorganik silt",
  };
}

export function classifyUSCS(input: USCSInput): USCSResult {
  const { grainSize, atterberg, isOrganic = false } = input;
  const { fines, passing4, d10, d30, d60 } = grainSize;

  const pi = atterberg ? atterberg.liquidLimit - atterberg.plasticLimit : undefined;
  const ll = atterberg?.liquidLimit;

  // Fine-grained: fines >= 50%
  if (fines >= 50) {
    if (!atterberg) {
      return {
        symbol: "??",
        name: "Unknown (Atterberg limits required)",
        nameTR: "Belirsiz (Atterberg limitleri gerekli)",
        description: "Fine-grained soil requires Atterberg limits for classification",
        descriptionTR: "İnce daneli zemin sınıflandırması için Atterberg limitleri gereklidir",
      };
    }
    return classifyFineGrained(ll!, pi!, isOrganic);
  }

  // Coarse-grained
  const coarseRetained = 100 - fines; // % coarse fraction
  const gravelFraction = 100 - passing4; // % retained on #4
  const sandFraction = passing4 - fines; // % between #4 and #200

  const isGravel = gravelFraction > sandFraction;
  const prefix = isGravel ? "G" : "S";
  const typeName = isGravel ? "Gravel" : "Sand";
  const typeNameTR = isGravel ? "Çakıl" : "Kum";

  const cu = d60 && d10 ? calcCu(d60, d10) : undefined;
  const cc = d30 && d60 && d10 ? calcCc(d30, d60, d10) : undefined;

  // Clean coarse-grained (fines < 5%)
  if (fines < 5) {
    const wellGradedCu = isGravel ? 4 : 6;
    const isWellGraded = cu !== undefined && cc !== undefined && cu >= wellGradedCu && cc >= 1 && cc <= 3;

    if (isWellGraded) {
      return {
        symbol: `${prefix}W`,
        name: `Well-Graded ${typeName}`,
        nameTR: `İyi Derecelenmiş ${typeNameTR}`,
        cu, cc,
        description: `Clean ${typeName.toLowerCase()} with good gradation`,
        descriptionTR: `İyi derecelenmiş temiz ${typeNameTR.toLowerCase()}`,
      };
    }
    return {
      symbol: `${prefix}P`,
      name: `Poorly-Graded ${typeName}`,
      nameTR: `Kötü Derecelenmiş ${typeNameTR}`,
      cu, cc,
      description: `Clean ${typeName.toLowerCase()} with poor gradation`,
      descriptionTR: `Kötü derecelenmiş temiz ${typeNameTR.toLowerCase()}`,
    };
  }

  // Coarse-grained with fines (5% ≤ fines < 50%)
  if (fines >= 5 && fines <= 12) {
    // Dual symbol
    const wellGradedCu = isGravel ? 4 : 6;
    const isWellGraded = cu !== undefined && cc !== undefined && cu >= wellGradedCu && cc >= 1 && cc <= 3;
    const gradation = isWellGraded ? "W" : "P";

    if (atterberg && pi !== undefined && ll !== undefined) {
      const aLine = 0.73 * (ll - 20);
      const fineType = pi > aLine && pi > 7 ? "C" : "M";
      return {
        symbol: `${prefix}${gradation}-${prefix}${fineType}`,
        name: `${isWellGraded ? "Well" : "Poorly"}-Graded ${typeName} with ${fineType === "C" ? "Clay" : "Silt"}`,
        nameTR: `${isWellGraded ? "İyi" : "Kötü"} Derecelenmiş ${typeNameTR} (${fineType === "C" ? "Killi" : "Siltli"})`,
        cu, cc, plasticityIndex: pi,
        description: `${typeName} with 5-12% fines, dual classification`,
        descriptionTR: `%5-12 ince dane içeren ${typeNameTR.toLowerCase()}, çift sembol sınıflandırma`,
      };
    }

    return {
      symbol: `${prefix}${gradation}`,
      name: `${isWellGraded ? "Well" : "Poorly"}-Graded ${typeName} with Fines`,
      nameTR: `${isWellGraded ? "İyi" : "Kötü"} Derecelenmiş ${typeNameTR} (İnce Daneli)`,
      cu, cc,
      description: `${typeName} with 5-12% fines`,
      descriptionTR: `%5-12 ince dane içeren ${typeNameTR.toLowerCase()}`,
    };
  }

  // fines > 12%
  if (atterberg && pi !== undefined && ll !== undefined) {
    const aLine = 0.73 * (ll - 20);
    if (pi > aLine && pi > 7) {
      return {
        symbol: `${prefix}C`,
        name: `Clayey ${typeName}`,
        nameTR: `Killi ${typeNameTR}`,
        plasticityIndex: pi, cu, cc,
        description: `${typeName} with >12% clay fines`,
        descriptionTR: `%12'den fazla kil içeren ${typeNameTR.toLowerCase()}`,
      };
    }
    return {
      symbol: `${prefix}M`,
      name: `Silty ${typeName}`,
      nameTR: `Siltli ${typeNameTR}`,
      plasticityIndex: pi, cu, cc,
      description: `${typeName} with >12% silt fines`,
      descriptionTR: `%12'den fazla silt içeren ${typeNameTR.toLowerCase()}`,
    };
  }

  return {
    symbol: `${prefix}?`,
    name: `${typeName} with Fines (Atterberg needed)`,
    nameTR: `İnce Daneli ${typeNameTR} (Atterberg gerekli)`,
    cu, cc,
    description: `${typeName} with >12% fines, Atterberg limits needed`,
    descriptionTR: `%12'den fazla ince dane, Atterberg limitleri gerekli`,
  };
}
