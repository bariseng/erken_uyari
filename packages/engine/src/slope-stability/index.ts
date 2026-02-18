/**
 * GeoForce Engine — Şev Stabilitesi
 * Bishop Basitleştirilmiş, Janbu Basitleştirilmiş, Fellenius (Ordinary)
 */

export interface SlopeInput {
  /** Şev yüksekliği H (m) */
  height: number;
  /** Şev açısı β (derece) */
  slopeAngle: number;
  /** Zemin birim hacim ağırlığı γ (kN/m³) */
  gamma: number;
  /** Kohezyon c (kPa) */
  cohesion: number;
  /** İçsel sürtünme açısı φ (derece) */
  frictionAngle: number;
  /** Yeraltı su seviyesi oranı ru — varsayılan 0 */
  ru?: number;
  /** Sismik katsayı kh (pseudo-statik) — varsayılan 0 */
  kh?: number;
  /** Dilim sayısı — varsayılan 10 */
  nSlices?: number;
}

export interface SlopeResult {
  method: string;
  /** Güvenlik katsayısı FS */
  FS: number;
  /** Kritik kayma dairesi yarıçapı R (m) */
  criticalRadius: number;
  /** Kritik kayma merkezi (x, y) */
  criticalCenter: { x: number; y: number };
  /** Dilim detayları */
  slices: SliceDetail[];
  /** Durum */
  status: "stable" | "marginal" | "unstable";
  statusTR: string;
}

export interface SliceDetail {
  /** Dilim numarası */
  index: number;
  /** Dilim orta noktası x (m) */
  x: number;
  /** Dilim genişliği (m) */
  width: number;
  /** Dilim ağırlığı W (kN/m) */
  weight: number;
  /** Taban açısı α (derece) */
  baseAngle: number;
  /** Taban uzunluğu l (m) */
  baseLength: number;
}

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

function analyzeCircle(
  input: SlopeInput,
  cx: number, cy: number, R: number,
  methodFn: "bishop" | "janbu" | "fellenius"
): { FS: number; slices: SliceDetail[] } {
  const { height: H, slopeAngle: beta, gamma, cohesion: c, frictionAngle: phi, ru = 0, kh = 0, nSlices = 10 } = input;
  const betaRad = toRad(beta);
  const phiRad = toRad(phi);
  const L = H / Math.tan(betaRad); // horizontal length of slope

  // Find intersection of circle with ground surface
  // Simplified: assume circle intersects at x=0 (toe) and x=xCrest
  const xToe = cx - Math.sqrt(Math.max(R * R - cy * cy, 0));
  const xTop = cx + Math.sqrt(Math.max(R * R - cy * cy, 0));
  const xMin = Math.max(xToe, -L * 0.2);
  const xMax = Math.min(xTop, L * 1.5);

  const dx = (xMax - xMin) / nSlices;
  const slices: SliceDetail[] = [];

  let sumResist = 0;
  let sumDrive = 0;

  // Initial FS guess for Bishop iteration
  let FS_prev = 1.5;

  for (let iter = 0; iter < 20; iter++) {
    sumResist = 0;
    sumDrive = 0;
    const tempSlices: SliceDetail[] = [];

    for (let i = 0; i < nSlices; i++) {
      const xMid = xMin + (i + 0.5) * dx;

      // Ground surface height at xMid
      let groundH: number;
      if (xMid <= 0) groundH = 0;
      else if (xMid >= L) groundH = H;
      else groundH = xMid * Math.tan(betaRad);

      // Circle height at xMid
      const dy2 = R * R - (xMid - cx) * (xMid - cx);
      if (dy2 < 0) continue;
      const circleY = cy - Math.sqrt(dy2);

      // Slice height
      const sliceH = Math.max(groundH - circleY, 0);
      if (sliceH <= 0.01) continue;

      const W = gamma * sliceH * dx;

      // Base angle
      const alpha = Math.atan2(xMid - cx, Math.sqrt(Math.max(dy2, 0)));
      const alphaDeg = toDeg(alpha);
      const baseLen = dx / Math.cos(alpha);

      // Pore pressure
      const u = ru * gamma * sliceH;

      if (methodFn === "fellenius") {
        // Ordinary Method of Slices
        const N = W * Math.cos(alpha) - u * baseLen;
        sumResist += c * baseLen + Math.max(N, 0) * Math.tan(phiRad);
        sumDrive += W * Math.sin(alpha) + kh * W * (sliceH / 2) / R;
      } else if (methodFn === "bishop") {
        // Bishop Simplified
        const ma = Math.cos(alpha) + (Math.sin(alpha) * Math.tan(phiRad)) / FS_prev;
        if (Math.abs(ma) < 0.001) continue;
        const resist = (c * baseLen + (W - u * baseLen) * Math.tan(phiRad)) / ma;
        sumResist += resist;
        sumDrive += W * Math.sin(alpha) + kh * W * (sliceH / 2) / R;
      } else {
        // Janbu Simplified
        const na = Math.cos(alpha) * Math.cos(alpha) + (Math.sin(alpha) * Math.cos(alpha) * Math.tan(phiRad)) / FS_prev;
        if (Math.abs(na) < 0.001) continue;
        const resist = (c * dx + (W - u * dx) * Math.tan(phiRad)) / na;
        sumResist += resist;
        sumDrive += W * Math.tan(alpha) + kh * W;
      }

      tempSlices.push({
        index: i + 1,
        x: round(xMid),
        width: round(dx),
        weight: round(W),
        baseAngle: round(alphaDeg),
        baseLength: round(baseLen),
      });
    }

    if (iter === 0 || methodFn === "fellenius") {
      slices.length = 0;
      slices.push(...tempSlices);
    }

    const FS_new = sumDrive > 0 ? sumResist / sumDrive : 99;

    if (methodFn === "fellenius") {
      return { FS: FS_new, slices: tempSlices };
    }

    if (Math.abs(FS_new - FS_prev) < 0.001) {
      return { FS: FS_new, slices: tempSlices };
    }
    FS_prev = FS_new;
    slices.length = 0;
    slices.push(...tempSlices);
  }

  return { FS: FS_prev, slices };
}

function searchCriticalCircle(input: SlopeInput, methodFn: "bishop" | "janbu" | "fellenius"): SlopeResult {
  const { height: H, slopeAngle: beta } = input;
  const betaRad = toRad(beta);
  const L = H / Math.tan(betaRad);

  let bestFS = 999;
  let bestCx = 0, bestCy = 0, bestR = 0;
  let bestSlices: SliceDetail[] = [];

  // Grid search for critical circle center
  const cxRange = [L * 0.2, L * 0.4, L * 0.5, L * 0.6, L * 0.8];
  const cyRange = [H * 0.8, H * 1.0, H * 1.2, H * 1.5, H * 2.0];
  const rRange = [H * 0.8, H * 1.0, H * 1.2, H * 1.5, H * 1.8];

  for (const cx of cxRange) {
    for (const cy of cyRange) {
      for (const R of rRange) {
        // Check circle passes through slope
        if (R < cy * 0.5) continue;
        try {
          const { FS, slices } = analyzeCircle(input, cx, cy, R, methodFn);
          if (FS > 0.1 && FS < bestFS && slices.length > 2) {
            bestFS = FS;
            bestCx = cx;
            bestCy = cy;
            bestR = R;
            bestSlices = slices;
          }
        } catch { /* skip invalid circles */ }
      }
    }
  }

  const status: SlopeResult["status"] = bestFS >= 1.5 ? "stable" : bestFS >= 1.0 ? "marginal" : "unstable";
  const statusTR = status === "stable" ? "Stabil" : status === "marginal" ? "Sınırda" : "Stabil Değil";
  const methodName = methodFn === "bishop" ? "Bishop Basitleştirilmiş" : methodFn === "janbu" ? "Janbu Basitleştirilmiş" : "Fellenius (Ordinary)";

  return {
    method: methodName,
    FS: round(bestFS, 3),
    criticalRadius: round(bestR),
    criticalCenter: { x: round(bestCx), y: round(bestCy) },
    slices: bestSlices,
    status,
    statusTR,
  };
}

export function bishop(input: SlopeInput): SlopeResult {
  return searchCriticalCircle(input, "bishop");
}

export function janbu(input: SlopeInput): SlopeResult {
  return searchCriticalCircle(input, "janbu");
}

export function fellenius(input: SlopeInput): SlopeResult {
  return searchCriticalCircle(input, "fellenius");
}
