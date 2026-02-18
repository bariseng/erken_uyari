/**
 * GeoForce Engine — AASHTO Zemin Sınıflandırma
 * AASHTO M 145 standardına göre sınıflandırma
 */

export interface AASHTOInput {
  /** % passing #200 sieve (0.075mm) */
  fines: number;
  /** % passing #40 sieve (0.425mm) */
  passing40: number;
  /** % passing #10 sieve (2.0mm) */
  passing10: number;
  /** Liquid Limit (%) */
  liquidLimit?: number;
  /** Plasticity Index (%) */
  plasticityIndex?: number;
}

export interface AASHTOResult {
  /** AASHTO group (e.g., "A-1-a", "A-2-4", "A-7-6") */
  group: string;
  /** Group Index */
  groupIndex: number;
  /** General description */
  description: string;
  descriptionTR: string;
  /** General rating as subgrade */
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  ratingTR: string;
}

function calcGroupIndex(fines: number, ll: number, pi: number): number {
  const F = Math.max(fines - 35, 0);
  const F2 = Math.max(fines - 15, 0);
  const gi = 0.2 * F + 0.005 * F * Math.max(ll - 40, 0) + 0.01 * F2 * Math.max(pi - 10, 0);
  return Math.max(0, Math.round(gi));
}

export function classifyAASHTO(input: AASHTOInput): AASHTOResult {
  const { fines, passing40, passing10, liquidLimit: ll, plasticityIndex: pi } = input;

  // Granular materials (≤35% passing #200)
  if (fines <= 35) {
    // A-1
    if (fines <= 15 && passing40 <= 50 && passing10 <= 50) {
      if (passing10 <= 50 && fines <= 15 && passing40 <= 30) {
        return {
          group: "A-1-a",
          groupIndex: 0,
          description: "Stone fragments, gravel, and sand",
          descriptionTR: "Taş parçaları, çakıl ve kum",
          rating: "Excellent",
          ratingTR: "Mükemmel",
        };
      }
      return {
        group: "A-1-b",
        groupIndex: 0,
        description: "Stone fragments, gravel, and sand",
        descriptionTR: "Taş parçaları, çakıl ve kum",
        rating: "Excellent",
        ratingTR: "Mükemmel",
      };
    }

    // A-3
    if (fines <= 10 && passing40 > 50 && (pi === undefined || pi === 0)) {
      return {
        group: "A-3",
        groupIndex: 0,
        description: "Fine sand",
        descriptionTR: "İnce kum",
        rating: "Excellent",
        ratingTR: "Mükemmel",
      };
    }

    // A-2 subgroups
    const gi = ll !== undefined && pi !== undefined ? calcGroupIndex(fines, ll, pi) : 0;

    if (ll !== undefined && pi !== undefined) {
      if (ll <= 40 && pi <= 10) {
        return {
          group: "A-2-4",
          groupIndex: gi,
          description: "Silty or clayey gravel and sand",
          descriptionTR: "Siltli veya killi çakıl ve kum",
          rating: "Good",
          ratingTR: "İyi",
        };
      }
      if (ll > 40 && pi <= 10) {
        return {
          group: "A-2-5",
          groupIndex: gi,
          description: "Silty or clayey gravel and sand",
          descriptionTR: "Siltli veya killi çakıl ve kum",
          rating: "Good",
          ratingTR: "İyi",
        };
      }
      if (ll <= 40 && pi > 10) {
        return {
          group: "A-2-6",
          groupIndex: gi,
          description: "Clayey gravel and sand",
          descriptionTR: "Killi çakıl ve kum",
          rating: "Good",
          ratingTR: "İyi",
        };
      }
      if (ll > 40 && pi > 10) {
        return {
          group: "A-2-7",
          groupIndex: gi,
          description: "Clayey gravel and sand",
          descriptionTR: "Killi çakıl ve kum",
          rating: "Good",
          ratingTR: "İyi",
        };
      }
    }

    return {
      group: "A-2",
      groupIndex: 0,
      description: "Silty or clayey gravel and sand",
      descriptionTR: "Siltli veya killi çakıl ve kum",
      rating: "Good",
      ratingTR: "İyi",
    };
  }

  // Silt-clay materials (>35% passing #200)
  if (ll === undefined || pi === undefined) {
    return {
      group: "A-4+",
      groupIndex: 0,
      description: "Fine-grained soil (Atterberg limits needed)",
      descriptionTR: "İnce daneli zemin (Atterberg limitleri gerekli)",
      rating: "Fair",
      ratingTR: "Orta",
    };
  }

  const gi = calcGroupIndex(fines, ll, pi);

  if (ll <= 40) {
    if (pi <= 10) {
      return {
        group: "A-4",
        groupIndex: gi,
        description: "Silty soils",
        descriptionTR: "Siltli zeminler",
        rating: "Fair",
        ratingTR: "Orta",
      };
    }
    return {
      group: "A-6",
      groupIndex: gi,
      description: "Clayey soils",
      descriptionTR: "Killi zeminler",
      rating: "Poor",
      ratingTR: "Kötü",
    };
  }

  // LL > 40
  if (pi <= 10) {
    return {
      group: "A-5",
      groupIndex: gi,
      description: "Silty soils (diatomaceous or micaceous)",
      descriptionTR: "Siltli zeminler (diyatomlu veya mikalı)",
      rating: "Fair",
      ratingTR: "Orta",
    };
  }

  // A-7
  if (pi <= ll - 30) {
    return {
      group: "A-7-5",
      groupIndex: gi,
      description: "Clayey soils (moderate plasticity)",
      descriptionTR: "Killi zeminler (orta plastisiteli)",
      rating: "Poor",
      ratingTR: "Kötü",
    };
  }
  return {
    group: "A-7-6",
    groupIndex: gi,
    description: "Clayey soils (high plasticity)",
    descriptionTR: "Killi zeminler (yüksek plastisiteli)",
    rating: "Poor",
    ratingTR: "Kötü",
  };
}
