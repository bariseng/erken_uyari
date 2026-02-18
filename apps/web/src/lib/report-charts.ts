/**
 * GeoForce — jsPDF Chart Engine
 * Saf jsPDF drawing primitifleri ile geoteknik grafikler
 *
 * Her fonksiyon: (doc, data, x, y, w, h) => yeni y pozisyonu
 */

import type jsPDF from "jspdf";

// ─── Stil Sabitleri ───

const C = {
  primary: [41, 98, 255] as RGB,
  green: [0, 200, 83] as RGB,
  red: [255, 23, 68] as RGB,
  orange: [255, 145, 0] as RGB,
  dark: [60, 60, 60] as RGB,
  gray: [150, 150, 150] as RGB,
  lightGray: [220, 220, 220] as RGB,
  white: [255, 255, 255] as RGB,
  purple: [156, 39, 176] as RGB,
  cyan: [0, 188, 212] as RGB,
  brown: [121, 85, 72] as RGB,
};

type RGB = [number, number, number];

// ─── Yardımcı Çizim Fonksiyonları ───

function setColor(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]); }
function setFill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]); }
function setText(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]); }

function dashedLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number) {
  (doc as any).setLineDashPattern([2, 2], 0);
  doc.line(x1, y1, x2, y2);
  (doc as any).setLineDashPattern([], 0);
}

function pageCheck(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) { doc.addPage(); return 30; }
  return y;
}

function drawTitle(doc: jsPDF, title: string, x: number, y: number, w: number): number {
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setText(doc, C.dark);
  doc.text(title, x + w / 2, y, { align: "center" });
  return y + 5;
}

function drawRef(doc: jsPDF, ref: string, x: number, y: number, w: number): number {
  doc.setFontSize(6);
  doc.setFont("helvetica", "italic");
  setText(doc, C.gray);
  doc.text(ref, x + w / 2, y, { align: "center" });
  return y + 5;
}

/** Eksen çerçevesi çiz — sol ve alt çizgi */
function drawAxes(doc: jsPDF, ox: number, oy: number, w: number, h: number) {
  doc.setLineWidth(0.3);
  setColor(doc, C.dark);
  doc.line(ox, oy, ox, oy + h);       // Y ekseni
  doc.line(ox, oy + h, ox + w, oy + h); // X ekseni
}

/** Grid çizgileri */
function drawGrid(doc: jsPDF, ox: number, oy: number, w: number, h: number, nx: number, ny: number) {
  doc.setLineWidth(0.1);
  setColor(doc, C.lightGray);
  for (let i = 1; i < nx; i++) {
    const gx = ox + (i / nx) * w;
    dashedLine(doc, gx, oy, gx, oy + h);
  }
  for (let j = 1; j < ny; j++) {
    const gy = oy + (j / ny) * h;
    dashedLine(doc, ox, gy, ox + w, gy);
  }
}

/** X ekseni etiketleri (alt) */
function labelXAxis(doc: jsPDF, labels: string[], ox: number, oy: number, w: number, h: number) {
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  setText(doc, C.dark);
  const n = labels.length;
  for (let i = 0; i < n; i++) {
    const lx = ox + (i / (n - 1)) * w;
    doc.text(labels[i], lx, oy + h + 3.5, { align: "center" });
  }
}

/** Y ekseni etiketleri (sol) */
function labelYAxis(doc: jsPDF, labels: string[], ox: number, oy: number, _w: number, h: number) {
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  setText(doc, C.dark);
  const n = labels.length;
  for (let i = 0; i < n; i++) {
    const ly = oy + (i / (n - 1)) * h;
    doc.text(labels[i], ox - 1.5, ly + 0.8, { align: "right" });
  }
}

/** Eksen başlığı */
function axisTitle(doc: jsPDF, title: string, cx: number, cy: number, vertical = false) {
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  setText(doc, C.dark);
  if (vertical) {
    doc.text(title, cx, cy, { angle: 90 });
  } else {
    doc.text(title, cx, cy, { align: "center" });
  }
}

/** Lejant çiz */
function drawLegend(doc: jsPDF, items: { label: string; color: RGB; dashed?: boolean }[], x: number, y: number) {
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  let lx = x;
  for (const item of items) {
    doc.setLineWidth(0.5);
    setColor(doc, item.color);
    if (item.dashed) {
      dashedLine(doc, lx, y, lx + 6, y);
    } else {
      doc.line(lx, y, lx + 6, y);
    }
    setText(doc, C.dark);
    doc.text(item.label, lx + 7.5, y + 0.5);
    lx += 7.5 + doc.getTextWidth(item.label) + 3;
  }
}

function niceScale(min: number, max: number, ticks: number): { min: number; max: number; step: number } {
  if (max <= min) max = min + 1;
  const range = max - min;
  const rough = range / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  let nice: number;
  if (residual <= 1.5) nice = 1;
  else if (residual <= 3) nice = 2;
  else if (residual <= 7) nice = 5;
  else nice = 10;
  const step = nice * mag;
  const nMin = Math.floor(min / step) * step;
  const nMax = Math.ceil(max / step) * step;
  return { min: nMin, max: nMax, step };
}

// ─── Chart Data Tipleri ───

export interface StressProfileChartData {
  profile: { depth: number; totalStress: number; porePressure: number; effectiveStress: number }[];
  waterTableDepth: number;
  layerBoundaries?: number[];
}

export interface SPTProfileChartData {
  points: { depth: number; N60: number; N1_60: number }[];
}

export interface BearingComparisonChartData {
  methods: { name: string; ultimate: number; allowable: number }[];
  safetyFactor: number;
}

export interface SettlementTimeChartData {
  curve: { time: number; U: number; settlement?: number }[];
  totalSettlement?: number;
}

export interface ConsolidationUTvChartData {
  curve: { Tv: number; U: number }[];
  calculatedPoint?: { Tv: number; U: number };
  pvdCurve?: { Tv: number; U: number }[];
}

export interface SlopeStabilityChartData {
  height: number;
  slopeAngle: number;
  center: { x: number; y: number };
  radius: number;
  FS: number;
  slices?: { x: number; width: number }[];
}

export interface LateralPressureChartData {
  depths: number[];
  activePressures: number[];
  passivePressures: number[];
  wallHeight: number;
  Ka: number;
  Kp: number;
}

export interface LiquefactionChartData {
  layers: { depth: number; CSR: number; CRR: number; FS: number; status: string }[];
  LPI: number;
}

export interface GrainSizeChartData {
  data: { sieveSize: number; percentPassing: number }[];
  D10?: number | null;
  D30?: number | null;
  D60?: number | null;
  Cu?: number | null;
  Cc?: number | null;
}

export interface ProctorChartData {
  points: { waterContent: number; dryDensity: number }[];
  fitCurve: { w: number; gammaD: number }[];
  zavCurve: { w: number; gammaDZav: number }[];
  optimumWaterContent: number;
  maxDryDensity: number;
  gammaD95: number;
}

export interface MohrCircleChartData {
  sigma1: number;
  sigma3: number;
  center: number;
  radius: number;
  cohesion?: number;
  frictionAngle?: number;
  circlePoints: { sigma: number; tau: number }[];
}

export interface ExcavationPressureChartData {
  excavationDepth: number;
  embedmentDepth: number;
  pressureDiagram: { depth: number; active: number; passive: number }[];
  anchorForces: number[];
  supportLevels?: number[];
  Ka: number;
  Kp: number;
}

export interface PileLoadTransferChartData {
  layers: { depthTop: number; depthBottom: number; type: string; qs: number; contribution: number }[];
  tipCapacity: number;
  shaftCapacity: number;
  ultimate: number;
  pileLength: number;
  pileDiameter: number;
}

export interface SoilProfileChartData {
  layers: { depthTop: number; depthBottom: number; name: string; soilType: string }[];
  waterTableDepth: number;
  totalDepth: number;
}

export interface SchmertmannChartData {
  contributions: { depth: number; Iz: number; Es: number }[];
  width: number;
  zMax: number;
}

export type ChartData =
  | { type: "stress-profile"; data: StressProfileChartData }
  | { type: "spt-profile"; data: SPTProfileChartData }
  | { type: "bearing-comparison"; data: BearingComparisonChartData }
  | { type: "settlement-time"; data: SettlementTimeChartData }
  | { type: "consolidation-utv"; data: ConsolidationUTvChartData }
  | { type: "slope-stability"; data: SlopeStabilityChartData }
  | { type: "lateral-pressure"; data: LateralPressureChartData }
  | { type: "liquefaction"; data: LiquefactionChartData }
  | { type: "grain-size"; data: GrainSizeChartData }
  | { type: "proctor"; data: ProctorChartData }
  | { type: "mohr-circle"; data: MohrCircleChartData }
  | { type: "excavation-pressure"; data: ExcavationPressureChartData }
  | { type: "pile-load-transfer"; data: PileLoadTransferChartData }
  | { type: "soil-profile"; data: SoilProfileChartData }
  | { type: "schmertmann"; data: SchmertmannChartData };

// ─── Dispatcher ───

export function drawChart(doc: jsPDF, chart: ChartData, x: number, y: number, w: number, h: number): number {
  switch (chart.type) {
    case "stress-profile": return drawStressProfileChart(doc, chart.data, x, y, w, h);
    case "spt-profile": return drawSPTProfileChart(doc, chart.data, x, y, w, h);
    case "bearing-comparison": return drawBearingComparisonChart(doc, chart.data, x, y, w, h);
    case "settlement-time": return drawSettlementTimeChart(doc, chart.data, x, y, w, h);
    case "consolidation-utv": return drawConsolidationUTvChart(doc, chart.data, x, y, w, h);
    case "slope-stability": return drawSlopeStabilityChart(doc, chart.data, x, y, w, h);
    case "lateral-pressure": return drawLateralPressureChart(doc, chart.data, x, y, w, h);
    case "liquefaction": return drawLiquefactionChart(doc, chart.data, x, y, w, h);
    case "grain-size": return drawGrainSizeChart(doc, chart.data, x, y, w, h);
    case "proctor": return drawProctorChart(doc, chart.data, x, y, w, h);
    case "mohr-circle": return drawMohrCircleChart(doc, chart.data, x, y, w, h);
    case "excavation-pressure": return drawExcavationPressureChart(doc, chart.data, x, y, w, h);
    case "pile-load-transfer": return drawPileLoadTransferChart(doc, chart.data, x, y, w, h);
    case "soil-profile": return drawSoilProfileChart(doc, chart.data, x, y, w, h);
    case "schmertmann": return drawSchmertmannChart(doc, chart.data, x, y, w, h);
  }
}

// ═══════════════════════════════════════════════════════════════
// 1. Gerilme Profili Grafiği
// ═══════════════════════════════════════════════════════════════

export function drawStressProfileChart(doc: jsPDF, data: StressProfileChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  const startY = y;
  y = drawTitle(doc, "Gerilme Profili (σ - Derinlik)", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const pts = data.profile;
  if (!pts.length) return startY + h + 10;

  const maxDepth = pts[pts.length - 1].depth || 1;
  const maxStress = Math.max(...pts.map(p => Math.max(p.totalStress, p.porePressure, p.effectiveStress)), 1);
  const sx = niceScale(0, maxStress, 5);
  const sy = niceScale(0, maxDepth, 5);

  drawAxes(doc, ox, oy, pw, ph);
  drawGrid(doc, ox, oy, pw, ph, 5, 5);

  // X labels (stress)
  const xLabels: string[] = [];
  for (let v = sx.min; v <= sx.max + 0.01; v += sx.step) xLabels.push(v.toFixed(0));
  labelXAxis(doc, xLabels, ox, oy, pw, ph);
  axisTitle(doc, "Gerilme (kPa)", ox + pw / 2, oy + ph + 8);

  // Y labels (depth — top=0, bottom=maxDepth)
  const yLabels: string[] = [];
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) yLabels.push(v.toFixed(1));
  labelYAxis(doc, yLabels, ox, oy, pw, ph);
  axisTitle(doc, "Derinlik (m)", ox - 14, oy + ph / 2, true);

  const mapX = (v: number) => ox + ((v - sx.min) / (sx.max - sx.min)) * pw;
  const mapY = (d: number) => oy + ((d - sy.min) / (sy.max - sy.min)) * ph;

  // Draw 3 lines: total, pore, effective
  const lines: { key: keyof typeof pts[0]; color: RGB; label: string }[] = [
    { key: "totalStress" as any, color: C.primary, label: "σ (toplam)" },
    { key: "porePressure" as any, color: C.cyan, label: "u (boşluk suyu)" },
    { key: "effectiveStress" as any, color: C.green, label: "σ' (efektif)" },
  ];

  for (const line of lines) {
    doc.setLineWidth(0.5);
    setColor(doc, line.color);
    for (let i = 1; i < pts.length; i++) {
      const v0 = (pts[i - 1] as any)[line.key] as number;
      const v1 = (pts[i] as any)[line.key] as number;
      doc.line(mapX(v0), mapY(pts[i - 1].depth), mapX(v1), mapY(pts[i].depth));
    }
  }

  // YASS çizgisi
  if (data.waterTableDepth >= sy.min && data.waterTableDepth <= sy.max) {
    doc.setLineWidth(0.3);
    setColor(doc, C.cyan);
    const wy = mapY(data.waterTableDepth);
    dashedLine(doc, ox, wy, ox + pw, wy);
    doc.setFontSize(5);
    setText(doc, C.cyan);
    doc.text("YASS", ox + pw + 1, wy + 0.5);
  }

  // Tabaka sınırları
  if (data.layerBoundaries) {
    doc.setLineWidth(0.15);
    setColor(doc, C.gray);
    for (const bd of data.layerBoundaries) {
      if (bd > sy.min && bd < sy.max) dashedLine(doc, ox, mapY(bd), ox + pw, mapY(bd));
    }
  }

  drawLegend(doc, lines.map(l => ({ label: l.label, color: l.color })), ox, oy + ph + 12);
  y = oy + ph + 17;
  y = drawRef(doc, "Referans: Das, Principles of Geotechnical Engineering", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 2. SPT N-Derinlik Profili
// ═══════════════════════════════════════════════════════════════

export function drawSPTProfileChart(doc: jsPDF, data: SPTProfileChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "SPT N - Derinlik Profili", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const pts = data.points;
  if (!pts.length) return y + h;

  const maxN = Math.max(...pts.map(p => Math.max(p.N60, p.N1_60)), 1);
  const maxD = Math.max(...pts.map(p => p.depth), 1);
  const sx = niceScale(0, maxN, 5);
  const sy = niceScale(0, maxD, 5);

  drawAxes(doc, ox, oy, pw, ph);
  drawGrid(doc, ox, oy, pw, ph, 5, 5);

  // Sıkılık/kıvam arka plan bantları
  const bands = [
    { nMax: 4, color: [255, 235, 238] as RGB },
    { nMax: 10, color: [255, 249, 196] as RGB },
    { nMax: 30, color: [232, 245, 233] as RGB },
    { nMax: 50, color: [200, 230, 201] as RGB },
  ];
  for (const band of bands) {
    const bx0 = mapVal(Math.max(band.nMax - (band.nMax <= 4 ? 4 : band.nMax <= 10 ? 6 : 20), 0), sx.min, sx.max, ox, ox + pw);
    const bx1 = mapVal(band.nMax, sx.min, sx.max, ox, ox + pw);
    if (bx1 > ox && bx0 < ox + pw) {
      setFill(doc, band.color);
      doc.rect(Math.max(bx0, ox), oy, Math.min(bx1, ox + pw) - Math.max(bx0, ox), ph, "F");
    }
  }

  // Re-draw axes on top
  drawAxes(doc, ox, oy, pw, ph);

  const barH = Math.min(ph / pts.length * 0.35, 3);
  for (const pt of pts) {
    const py = mapVal(pt.depth, sy.min, sy.max, oy, oy + ph);
    // N60 bar
    const bw60 = ((pt.N60 - sx.min) / (sx.max - sx.min)) * pw;
    setFill(doc, C.primary);
    doc.rect(ox, py - barH, Math.max(bw60, 0.5), barH, "F");
    // (N1)60 bar
    const bw160 = ((pt.N1_60 - sx.min) / (sx.max - sx.min)) * pw;
    setFill(doc, C.orange);
    doc.rect(ox, py, Math.max(bw160, 0.5), barH, "F");
  }

  const xLabels: string[] = [];
  for (let v = sx.min; v <= sx.max + 0.01; v += sx.step) xLabels.push(v.toFixed(0));
  labelXAxis(doc, xLabels, ox, oy, pw, ph);
  axisTitle(doc, "N degeri", ox + pw / 2, oy + ph + 8);

  const yLabels: string[] = [];
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) yLabels.push(v.toFixed(1));
  labelYAxis(doc, yLabels, ox, oy, pw, ph);
  axisTitle(doc, "Derinlik (m)", ox - 14, oy + ph / 2, true);

  drawLegend(doc, [{ label: "N60", color: C.primary }, { label: "(N1)60", color: C.orange }], ox, oy + ph + 12);
  y = oy + ph + 17;
  y = drawRef(doc, "Referans: Liao & Whitman, 1986", x, y, w);
  return y;
}

function mapVal(v: number, min: number, max: number, pMin: number, pMax: number): number {
  return pMin + ((v - min) / (max - min)) * (pMax - pMin);
}

// ═══════════════════════════════════════════════════════════════
// 3. Taşıma Kapasitesi Karşılaştırma
// ═══════════════════════════════════════════════════════════════

export function drawBearingComparisonChart(doc: jsPDF, data: BearingComparisonChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Tasima Kapasitesi Karsilastirma", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const methods = data.methods;
  if (!methods.length) return y + h;

  const maxVal = Math.max(...methods.map(m => Math.max(m.ultimate, m.allowable)), 1);
  const sy = niceScale(0, maxVal, 5);

  drawAxes(doc, ox, oy, pw, ph);
  drawGrid(doc, ox, oy, pw, ph, methods.length, 5);

  const groupW = pw / methods.length;
  const barW = groupW * 0.3;

  for (let i = 0; i < methods.length; i++) {
    const m = methods[i];
    const gx = ox + i * groupW + groupW * 0.15;

    // qu bar
    const quH = ((m.ultimate - sy.min) / (sy.max - sy.min)) * ph;
    setFill(doc, C.primary);
    doc.rect(gx, oy + ph - quH, barW, quH, "F");

    // qa bar
    const qaH = ((m.allowable - sy.min) / (sy.max - sy.min)) * ph;
    setFill(doc, C.green);
    doc.rect(gx + barW + 1, oy + ph - qaH, barW, qaH, "F");

    // Method label
    doc.setFontSize(5.5);
    setText(doc, C.dark);
    doc.text(m.name, gx + barW, oy + ph + 3.5, { align: "center" });
  }

  // Y labels
  const yLabels: string[] = [];
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) yLabels.push(v.toFixed(0));
  // Reverse for bottom-up
  labelYAxis(doc, [...yLabels].reverse(), ox, oy, pw, ph);
  axisTitle(doc, "Kapasite (kPa)", ox - 14, oy + ph / 2, true);

  drawLegend(doc, [{ label: "qu (nihai)", color: C.primary }, { label: "qa (izin ver.)", color: C.green }], ox, oy + ph + 12);
  y = oy + ph + 17;
  y = drawRef(doc, "Referans: Terzaghi 1943, Meyerhof 1963, Hansen 1970, Vesic 1973", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 4. Oturma Zaman Eğrisi
// ═══════════════════════════════════════════════════════════════

export function drawSettlementTimeChart(doc: jsPDF, data: SettlementTimeChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Oturma - Zaman Egrisi", x, y, w);

  const pad = { l: 18, r: 18, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const curve = data.curve;
  if (!curve.length) return y + h;

  const maxTime = Math.max(...curve.map(c => c.time), 1);
  const maxS = data.totalSettlement ? data.totalSettlement : Math.max(...curve.filter(c => c.settlement != null).map(c => c.settlement!), 1);
  const tx = niceScale(0, maxTime, 5);

  drawAxes(doc, ox, oy, pw, ph);
  drawGrid(doc, ox, oy, pw, ph, 5, 5);
  // Right axis for U%
  doc.setLineWidth(0.3);
  setColor(doc, C.dark);
  doc.line(ox + pw, oy, ox + pw, oy + ph);

  const mapX = (t: number) => ox + ((t - tx.min) / (tx.max - tx.min)) * pw;
  const mapYs = (s: number) => oy + (s / maxS) * ph; // settlement downward
  const mapYu = (u: number) => oy + ph - (u / 100) * ph; // U% upward

  // Settlement line
  doc.setLineWidth(0.5);
  setColor(doc, C.primary);
  const sPts = curve.filter(c => c.settlement != null);
  for (let i = 1; i < sPts.length; i++) {
    doc.line(mapX(sPts[i - 1].time), mapYs(sPts[i - 1].settlement!), mapX(sPts[i].time), mapYs(sPts[i].settlement!));
  }

  // U% line
  doc.setLineWidth(0.5);
  setColor(doc, C.green);
  for (let i = 1; i < curve.length; i++) {
    doc.line(mapX(curve[i - 1].time), mapYu(curve[i - 1].U), mapX(curve[i].time), mapYu(curve[i].U));
  }

  // X labels
  const xLabels: string[] = [];
  for (let v = tx.min; v <= tx.max + 0.01; v += tx.step) xLabels.push(v < 1 ? v.toFixed(2) : v.toFixed(1));
  labelXAxis(doc, xLabels, ox, oy, pw, ph);
  axisTitle(doc, "Zaman (yil)", ox + pw / 2, oy + ph + 8);

  // Left Y labels (settlement, downward)
  const sLabels: string[] = [];
  for (let i = 0; i <= 5; i++) sLabels.push((maxS * i / 5).toFixed(1));
  labelYAxis(doc, sLabels, ox, oy, pw, ph);
  axisTitle(doc, "Oturma (mm)", ox - 14, oy + ph / 2, true);

  // Right Y labels (U%)
  doc.setFontSize(6);
  setText(doc, C.green);
  for (let i = 0; i <= 5; i++) {
    const uy = oy + ph - (i / 5) * ph;
    doc.text(`${(i * 20).toFixed(0)}%`, ox + pw + 2, uy + 0.8);
  }
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("U (%)", ox + pw + 14, oy + ph / 2, { angle: 90 });

  drawLegend(doc, [{ label: "Oturma", color: C.primary }, { label: "U (%)", color: C.green }], ox, oy + ph + 12);
  y = oy + ph + 17;
  y = drawRef(doc, "Referans: Terzaghi, 1D Konsolidasyon Teorisi", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 5. Konsolidasyon Derecesi (U-Tv)
// ═══════════════════════════════════════════════════════════════

export function drawConsolidationUTvChart(doc: jsPDF, data: ConsolidationUTvChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Konsolidasyon Derecesi (U - Tv)", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const curve = data.curve;
  if (!curve.length) return y + h;

  const maxTv = Math.max(...curve.map(c => c.Tv), 0.5);
  const tx = niceScale(0, maxTv, 5);

  drawAxes(doc, ox, oy, pw, ph);
  drawGrid(doc, ox, oy, pw, ph, 5, 5);

  const mapX = (tv: number) => ox + ((tv - tx.min) / (tx.max - tx.min)) * pw;
  const mapY = (u: number) => oy + (u / 100) * ph; // U% downward (0 top, 100 bottom)

  // Theoretical curve
  doc.setLineWidth(0.5);
  setColor(doc, C.primary);
  for (let i = 1; i < curve.length; i++) {
    doc.line(mapX(curve[i - 1].Tv), mapY(curve[i - 1].U), mapX(curve[i].Tv), mapY(curve[i].U));
  }

  // PVD curve if available
  if (data.pvdCurve && data.pvdCurve.length > 1) {
    doc.setLineWidth(0.5);
    setColor(doc, C.green);
    for (let i = 1; i < data.pvdCurve.length; i++) {
      doc.line(mapX(data.pvdCurve[i - 1].Tv), mapY(data.pvdCurve[i - 1].U), mapX(data.pvdCurve[i].Tv), mapY(data.pvdCurve[i].U));
    }
  }

  // Calculated point marker
  if (data.calculatedPoint) {
    const cpx = mapX(data.calculatedPoint.Tv);
    const cpy = mapY(data.calculatedPoint.U);
    setFill(doc, C.red);
    setColor(doc, C.red);
    doc.circle(cpx, cpy, 1.2, "FD");
    doc.setFontSize(5);
    setText(doc, C.red);
    doc.text(`Tv=${data.calculatedPoint.Tv.toFixed(3)}, U=${data.calculatedPoint.U.toFixed(1)}%`, cpx + 2, cpy - 1);
  }

  const xLabels: string[] = [];
  for (let v = tx.min; v <= tx.max + 0.001; v += tx.step) xLabels.push(v.toFixed(2));
  labelXAxis(doc, xLabels, ox, oy, pw, ph);
  axisTitle(doc, "Tv (zaman faktoru)", ox + pw / 2, oy + ph + 8);

  const yLabels: string[] = [];
  for (let i = 0; i <= 5; i++) yLabels.push(`${(i * 20).toFixed(0)}`);
  labelYAxis(doc, yLabels, ox, oy, pw, ph);
  axisTitle(doc, "U (%)", ox - 14, oy + ph / 2, true);

  const legendItems: { label: string; color: RGB; dashed?: boolean }[] = [{ label: "Teorik", color: C.primary }];
  if (data.pvdCurve) legendItems.push({ label: "PVD (drenli)", color: C.green });
  drawLegend(doc, legendItems, ox, oy + ph + 12);
  y = oy + ph + 17;
  y = drawRef(doc, "Referans: Terzaghi, 1943", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 6. Şev Stabilitesi Kesiti
// ═══════════════════════════════════════════════════════════════

export function drawSlopeStabilityChart(doc: jsPDF, data: SlopeStabilityChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, `Sev Stabilitesi Kesiti (FS = ${data.FS.toFixed(3)})`, x, y, w);

  const pad = { l: 5, r: 5, t: 3, b: 8 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const H = data.height;
  const beta = data.slopeAngle * Math.PI / 180;
  const L = H / Math.tan(beta);
  const totalW = L * 2.5;
  const totalH = H * 1.8;
  const scale = Math.min(pw / totalW, ph / totalH);

  const toX = (v: number) => ox + 10 + v * scale;
  const toY = (v: number) => oy + ph - 5 - v * scale;

  // Ground surface
  doc.setLineWidth(0.5);
  setColor(doc, C.brown);
  // Toe to crest
  doc.line(toX(-L * 0.3), toY(0), toX(0), toY(0)); // flat before toe
  doc.line(toX(0), toY(0), toX(L), toY(H)); // slope face
  doc.line(toX(L), toY(H), toX(L * 1.8), toY(H)); // flat after crest

  // Fill slope body
  setFill(doc, [230, 220, 200] as RGB);
  const slopePoints = [
    toX(-L * 0.3), toY(0),
    toX(0), toY(0),
    toX(L), toY(H),
    toX(L * 1.8), toY(H),
    toX(L * 1.8), toY(0),
    toX(-L * 0.3), toY(0),
  ];
  // Manual polygon fill using triangles
  doc.setLineWidth(0);
  // Simple rect fill below slope
  setFill(doc, [240, 232, 216] as RGB);
  doc.rect(toX(-L * 0.3), toY(H), toX(L * 1.8) - toX(-L * 0.3), toY(0) - toY(H), "F");

  // Re-draw slope line on top
  doc.setLineWidth(0.5);
  setColor(doc, C.brown);
  doc.line(toX(-L * 0.3), toY(0), toX(0), toY(0));
  doc.line(toX(0), toY(0), toX(L), toY(H));
  doc.line(toX(L), toY(H), toX(L * 1.8), toY(H));

  // Failure circle (arc)
  const cx = data.center.x, cy = data.center.y, R = data.radius;
  doc.setLineWidth(0.4);
  setColor(doc, C.red);
  // Draw arc as polyline segments
  const arcSteps = 40;
  for (let i = 0; i < arcSteps; i++) {
    const a1 = -Math.PI * 0.3 + (i / arcSteps) * Math.PI * 1.1;
    const a2 = -Math.PI * 0.3 + ((i + 1) / arcSteps) * Math.PI * 1.1;
    const x1 = cx + R * Math.cos(a1), y1 = cy - R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2), y2 = cy - R * Math.sin(a2);
    // Only draw if within reasonable bounds
    if (y1 >= -H * 0.5 && y2 >= -H * 0.5 && y1 <= H * 2 && y2 <= H * 2) {
      doc.line(toX(x1), toY(y1), toX(x2), toY(y2));
    }
  }

  // FS label
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const fsColor: RGB = data.FS >= 1.5 ? C.green : data.FS >= 1.0 ? C.orange : C.red;
  setText(doc, fsColor);
  doc.text(`FS = ${data.FS.toFixed(3)}`, ox + pw - 25, oy + 8);

  // Status
  const status = data.FS >= 1.5 ? "Stabil" : data.FS >= 1.0 ? "Sinirda" : "Stabil Degil";
  doc.setFontSize(7);
  doc.text(status, ox + pw - 25, oy + 13);

  // Dimension labels
  doc.setFontSize(5);
  setText(doc, C.dark);
  doc.text(`H=${H}m`, toX(L / 2) - 3, toY(H / 2) - 1);
  doc.text(`β=${data.slopeAngle}°`, toX(L * 0.3), toY(H * 0.2));

  y = oy + ph + 3;
  y = drawRef(doc, "Referans: Bishop Basitlestirilmis Yontemi", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 7. Yanal Basınç Diyagramı
// ═══════════════════════════════════════════════════════════════

export function drawLateralPressureChart(doc: jsPDF, data: LateralPressureChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Yanal Toprak Basinci Diyagrami", x, y, w);

  const pad = { l: 18, r: 18, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const depths = data.depths;
  const maxD = Math.max(...depths, 1);
  const maxA = Math.max(...data.activePressures, 1);
  const maxP = Math.max(...data.passivePressures, 1);
  const maxPress = Math.max(maxA, maxP);
  const sx = niceScale(0, maxPress, 4);
  const sy = niceScale(0, maxD, 5);

  // Center wall line
  const wallX = ox + pw / 2;

  // Draw wall
  doc.setLineWidth(1);
  setColor(doc, C.dark);
  doc.line(wallX, oy, wallX, oy + ph);

  // Active pressure (left side, red fill)
  doc.setLineWidth(0.3);
  setColor(doc, C.red);
  setFill(doc, [255, 200, 200] as RGB);
  const halfW = pw / 2 - 2;
  for (let i = 0; i < depths.length - 1; i++) {
    const y1 = mapVal(depths[i], sy.min, sy.max, oy, oy + ph);
    const y2 = mapVal(depths[i + 1], sy.min, sy.max, oy, oy + ph);
    const x1 = wallX - (data.activePressures[i] / sx.max) * halfW;
    const x2 = wallX - (data.activePressures[i + 1] / sx.max) * halfW;
    // Fill trapezoid
    doc.line(x1, y1, x2, y2);
  }
  // Fill area
  setFill(doc, [255, 220, 220] as RGB);
  for (let i = 0; i < depths.length - 1; i++) {
    const y1 = mapVal(depths[i], sy.min, sy.max, oy, oy + ph);
    const y2 = mapVal(depths[i + 1], sy.min, sy.max, oy, oy + ph);
    const x1 = wallX - (data.activePressures[i] / sx.max) * halfW;
    const x2 = wallX - (data.activePressures[i + 1] / sx.max) * halfW;
    doc.rect(Math.min(x1, x2), y1, wallX - Math.min(x1, x2), y2 - y1, "F");
  }
  // Redraw active line on top
  setColor(doc, C.red);
  doc.setLineWidth(0.5);
  for (let i = 0; i < depths.length - 1; i++) {
    const y1 = mapVal(depths[i], sy.min, sy.max, oy, oy + ph);
    const y2 = mapVal(depths[i + 1], sy.min, sy.max, oy, oy + ph);
    const x1 = wallX - (data.activePressures[i] / sx.max) * halfW;
    const x2 = wallX - (data.activePressures[i + 1] / sx.max) * halfW;
    doc.line(x1, y1, x2, y2);
  }

  // Passive pressure (right side, green fill)
  setFill(doc, [220, 255, 220] as RGB);
  setColor(doc, C.green);
  doc.setLineWidth(0.5);
  for (let i = 0; i < depths.length - 1; i++) {
    const y1 = mapVal(depths[i], sy.min, sy.max, oy, oy + ph);
    const y2 = mapVal(depths[i + 1], sy.min, sy.max, oy, oy + ph);
    const x1 = wallX + (data.passivePressures[i] / sx.max) * halfW;
    const x2 = wallX + (data.passivePressures[i + 1] / sx.max) * halfW;
    if (data.passivePressures[i] > 0 || data.passivePressures[i + 1] > 0) {
      doc.rect(wallX, y1, Math.max(x1, x2) - wallX, y2 - y1, "F");
      doc.line(x1, y1, x2, y2);
    }
  }

  // Labels
  doc.setFontSize(6);
  setText(doc, C.red);
  doc.text(`Ka = ${data.Ka.toFixed(3)}`, ox + 2, oy + 5);
  setText(doc, C.green);
  doc.text(`Kp = ${data.Kp.toFixed(3)}`, ox + pw - 15, oy + 5);

  // Y axis labels
  const yLabels: string[] = [];
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) yLabels.push(v.toFixed(1));
  labelYAxis(doc, yLabels, ox, oy, pw, ph);
  axisTitle(doc, "Derinlik (m)", ox - 14, oy + ph / 2, true);

  // X axis labels (pressure)
  doc.setFontSize(5);
  setText(doc, C.red);
  doc.text("Aktif (kPa)", ox + 5, oy + ph + 4);
  setText(doc, C.green);
  doc.text("Pasif (kPa)", ox + pw - 18, oy + ph + 4);

  drawLegend(doc, [{ label: "Aktif", color: C.red }, { label: "Pasif", color: C.green }], ox, oy + ph + 10);
  y = oy + ph + 15;
  y = drawRef(doc, "Referans: Rankine / Coulomb", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 8. Sıvılaşma Profili
// ═══════════════════════════════════════════════════════════════

export function drawLiquefactionChart(doc: jsPDF, data: LiquefactionChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, `Sivilasma Degerlendirmesi (LPI = ${data.LPI.toFixed(1)})`, x, y, w);

  const pad = { l: 14, r: 5, t: 3, b: 10 };
  const oy = y + pad.t;
  const ph = h - pad.t - pad.b;
  const panelW = (w - pad.l - pad.r - 8) / 2;
  const oxL = x + pad.l;
  const oxR = oxL + panelW + 8;

  const layers = data.layers;
  if (!layers.length) return y + h;

  const maxD = Math.max(...layers.map(l => l.depth), 1);
  const maxCSR = Math.max(...layers.map(l => Math.max(l.CSR, l.CRR)), 0.5);
  const sy = niceScale(0, maxD, 5);
  const sxL = niceScale(0, maxCSR, 4);

  // ── Left panel: CSR vs CRR ──
  drawAxes(doc, oxL, oy, panelW, ph);
  drawGrid(doc, oxL, oy, panelW, ph, 4, 5);

  const mapYd = (d: number) => oy + ((d - sy.min) / (sy.max - sy.min)) * ph;
  const mapXl = (v: number) => oxL + ((v - sxL.min) / (sxL.max - sxL.min)) * panelW;

  // CSR line
  doc.setLineWidth(0.5);
  setColor(doc, C.red);
  for (let i = 1; i < layers.length; i++) {
    doc.line(mapXl(layers[i - 1].CSR), mapYd(layers[i - 1].depth), mapXl(layers[i].CSR), mapYd(layers[i].depth));
  }
  // CRR line
  setColor(doc, C.green);
  for (let i = 1; i < layers.length; i++) {
    doc.line(mapXl(layers[i - 1].CRR), mapYd(layers[i - 1].depth), mapXl(layers[i].CRR), mapYd(layers[i].depth));
  }

  // Liquefiable layers — red hatching
  for (const l of layers) {
    if (l.status === "liquefiable") {
      setFill(doc, [255, 230, 230] as RGB);
      const ly = mapYd(l.depth) - 2;
      doc.rect(oxL, ly, panelW, 4, "F");
      // Hatch lines
      doc.setLineWidth(0.1);
      setColor(doc, C.red);
      for (let hx = oxL; hx < oxL + panelW; hx += 2) {
        doc.line(hx, ly, hx + 2, ly + 4);
      }
    }
  }

  const xlLabels: string[] = [];
  for (let v = sxL.min; v <= sxL.max + 0.001; v += sxL.step) xlLabels.push(v.toFixed(2));
  labelXAxis(doc, xlLabels, oxL, oy, panelW, ph);
  axisTitle(doc, "CSR / CRR", oxL + panelW / 2, oy + ph + 8);

  const yLabels: string[] = [];
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) yLabels.push(v.toFixed(1));
  labelYAxis(doc, yLabels, oxL, oy, panelW, ph);
  axisTitle(doc, "Derinlik (m)", oxL - 11, oy + ph / 2, true);

  // ── Right panel: FS profile ──
  drawAxes(doc, oxR, oy, panelW, ph);
  drawGrid(doc, oxR, oy, panelW, ph, 4, 5);

  const maxFS = Math.max(...layers.map(l => l.FS), 2);
  const sxR = niceScale(0, maxFS, 4);
  const mapXr = (v: number) => oxR + ((v - sxR.min) / (sxR.max - sxR.min)) * panelW;

  // FS line
  doc.setLineWidth(0.5);
  setColor(doc, C.primary);
  for (let i = 1; i < layers.length; i++) {
    doc.line(mapXr(layers[i - 1].FS), mapYd(layers[i - 1].depth), mapXr(layers[i].FS), mapYd(layers[i].depth));
  }

  // FS=1 reference line
  if (1 >= sxR.min && 1 <= sxR.max) {
    doc.setLineWidth(0.3);
    setColor(doc, C.red);
    dashedLine(doc, mapXr(1), oy, mapXr(1), oy + ph);
    doc.setFontSize(5);
    setText(doc, C.red);
    doc.text("FS=1", mapXr(1) + 0.5, oy + 3);
  }

  const xrLabels: string[] = [];
  for (let v = sxR.min; v <= sxR.max + 0.001; v += sxR.step) xrLabels.push(v.toFixed(1));
  labelXAxis(doc, xrLabels, oxR, oy, panelW, ph);
  axisTitle(doc, "FS", oxR + panelW / 2, oy + ph + 8);

  // LPI label
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const lpiColor: RGB = data.LPI <= 2 ? C.green : data.LPI <= 5 ? C.orange : C.red;
  setText(doc, lpiColor);
  doc.text(`LPI = ${data.LPI.toFixed(1)}`, oxR + panelW - 15, oy + 5);

  drawLegend(doc, [{ label: "CSR", color: C.red }, { label: "CRR", color: C.green }, { label: "FS", color: C.primary }], oxL, oy + ph + 12);
  y = oy + ph + 17;
  y = drawRef(doc, "Referans: Boulanger & Idriss, 2014", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 9. Dane Dağılımı Eğrisi
// ═══════════════════════════════════════════════════════════════

export function drawGrainSizeChart(doc: jsPDF, data: GrainSizeChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Dane Dagilimi Egrisi (Granulometri)", x, y, w);

  const pad = { l: 18, r: 5, t: 8, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const pts = [...data.data].sort((a, b) => a.sieveSize - b.sieveSize);
  if (pts.length < 2) return y + h;

  // Logarithmic X axis
  const minSize = Math.max(pts[0].sieveSize, 0.001);
  const maxSize = Math.max(pts[pts.length - 1].sieveSize, 100);
  const logMin = Math.floor(Math.log10(minSize));
  const logMax = Math.ceil(Math.log10(maxSize));

  drawAxes(doc, ox, oy, pw, ph);

  // Soil classification bands at top
  const bands: { label: string; min: number; max: number; color: RGB }[] = [
    { label: "Kil", min: 0.001, max: 0.002, color: [255, 224, 178] as RGB },
    { label: "Silt", min: 0.002, max: 0.075, color: [255, 245, 157] as RGB },
    { label: "Kum", min: 0.075, max: 4.75, color: [200, 230, 201] as RGB },
    { label: "Cakil", min: 4.75, max: 100, color: [187, 222, 251] as RGB },
  ];
  const bandH = 5;
  for (const band of bands) {
    const bx1 = ox + ((Math.log10(Math.max(band.min, Math.pow(10, logMin))) - logMin) / (logMax - logMin)) * pw;
    const bx2 = ox + ((Math.log10(Math.min(band.max, Math.pow(10, logMax))) - logMin) / (logMax - logMin)) * pw;
    if (bx2 > bx1) {
      setFill(doc, band.color);
      doc.rect(Math.max(bx1, ox), oy - bandH, Math.min(bx2, ox + pw) - Math.max(bx1, ox), bandH, "F");
      doc.setFontSize(5);
      setText(doc, C.dark);
      const cx = (Math.max(bx1, ox) + Math.min(bx2, ox + pw)) / 2;
      doc.text(band.label, cx, oy - 1.5, { align: "center" });
    }
  }

  // Grid lines at standard sieve sizes
  const sieves = [0.001, 0.002, 0.01, 0.075, 0.15, 0.3, 0.6, 1, 2, 4.75, 10, 25, 50, 100];
  doc.setLineWidth(0.1);
  setColor(doc, C.lightGray);
  for (const s of sieves) {
    if (s >= Math.pow(10, logMin) && s <= Math.pow(10, logMax)) {
      const gx = ox + ((Math.log10(s) - logMin) / (logMax - logMin)) * pw;
      dashedLine(doc, gx, oy, gx, oy + ph);
    }
  }
  // Horizontal grid
  for (let p = 0; p <= 100; p += 20) {
    const gy = oy + ph - (p / 100) * ph;
    dashedLine(doc, ox, gy, ox + pw, gy);
  }

  const mapX = (size: number) => ox + ((Math.log10(Math.max(size, 0.0001)) - logMin) / (logMax - logMin)) * pw;
  const mapY = (pct: number) => oy + ph - (pct / 100) * ph;

  // Data curve
  doc.setLineWidth(0.5);
  setColor(doc, C.primary);
  for (let i = 1; i < pts.length; i++) {
    doc.line(mapX(pts[i - 1].sieveSize), mapY(pts[i - 1].percentPassing), mapX(pts[i].sieveSize), mapY(pts[i].percentPassing));
  }
  // Data points
  for (const pt of pts) {
    setFill(doc, C.primary);
    doc.circle(mapX(pt.sieveSize), mapY(pt.percentPassing), 0.7, "F");
  }

  // D10, D30, D60 markers
  const dMarkers: { label: string; val: number | null | undefined; color: RGB }[] = [
    { label: "D10", val: data.D10, color: C.red },
    { label: "D30", val: data.D30, color: C.orange },
    { label: "D60", val: data.D60, color: C.green },
  ];
  for (const dm of dMarkers) {
    if (dm.val && dm.val > 0) {
      const dx = mapX(dm.val);
      const pct = dm.label === "D10" ? 10 : dm.label === "D30" ? 30 : 60;
      const dy = mapY(pct);
      doc.setLineWidth(0.2);
      setColor(doc, dm.color);
      dashedLine(doc, dx, oy + ph, dx, dy);
      dashedLine(doc, ox, dy, dx, dy);
      setFill(doc, dm.color);
      doc.circle(dx, dy, 1, "F");
      doc.setFontSize(5);
      setText(doc, dm.color);
      doc.text(`${dm.label}=${dm.val.toFixed(3)}`, dx + 1.5, dy - 1.5);
    }
  }

  // X labels
  const xTicks: number[] = [];
  for (let e = logMin; e <= logMax; e++) xTicks.push(Math.pow(10, e));
  doc.setFontSize(5.5);
  setText(doc, C.dark);
  for (const t of xTicks) {
    const tx = mapX(t);
    doc.text(t >= 1 ? t.toFixed(0) : t.toString(), tx, oy + ph + 3.5, { align: "center" });
  }
  axisTitle(doc, "Dane Capi (mm)", ox + pw / 2, oy + ph + 8);

  // Y labels
  for (let p = 0; p <= 100; p += 20) {
    doc.setFontSize(6);
    setText(doc, C.dark);
    doc.text(p.toFixed(0), ox - 1.5, mapY(p) + 0.8, { align: "right" });
  }
  axisTitle(doc, "Gecen %", ox - 14, oy + ph / 2, true);

  // Cu, Cc labels
  if (data.Cu != null && data.Cc != null) {
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    setText(doc, C.dark);
    doc.text(`Cu = ${data.Cu.toFixed(1)}  Cc = ${data.Cc.toFixed(2)}`, ox + pw - 30, oy + ph - 3);
  }

  y = oy + ph + 12;
  y = drawRef(doc, "Referans: ASTM D6913 / TS EN ISO 17892-4", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 10. Proctor Eğrisi
// ═══════════════════════════════════════════════════════════════

export function drawProctorChart(doc: jsPDF, data: ProctorChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Proctor Kompaksiyon Egrisi", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const allW = [...data.points.map(p => p.waterContent), ...data.fitCurve.map(p => p.w)];
  const allG = [...data.points.map(p => p.dryDensity), ...data.fitCurve.map(p => p.gammaD)];
  const sxW = niceScale(Math.min(...allW) - 2, Math.max(...allW) + 2, 5);
  const syG = niceScale(Math.min(...allG) - 0.5, Math.max(...allG) + 0.5, 5);

  drawAxes(doc, ox, oy, pw, ph);
  drawGrid(doc, ox, oy, pw, ph, 5, 5);

  const mapX = (wc: number) => ox + ((wc - sxW.min) / (sxW.max - sxW.min)) * pw;
  const mapY = (gd: number) => oy + ph - ((gd - syG.min) / (syG.max - syG.min)) * ph;

  // ZAV curve (dashed)
  if (data.zavCurve.length > 1) {
    doc.setLineWidth(0.3);
    setColor(doc, C.gray);
    for (let i = 1; i < data.zavCurve.length; i++) {
      const p0 = data.zavCurve[i - 1], p1 = data.zavCurve[i];
      if (p0.gammaDZav >= syG.min && p1.gammaDZav >= syG.min) {
        dashedLine(doc, mapX(p0.w), mapY(p0.gammaDZav), mapX(p1.w), mapY(p1.gammaDZav));
      }
    }
    doc.setFontSize(5);
    setText(doc, C.gray);
    const lastZav = data.zavCurve[data.zavCurve.length - 1];
    doc.text("ZAV", mapX(lastZav.w) + 1, mapY(lastZav.gammaDZav));
  }

  // Fit curve (solid blue)
  if (data.fitCurve.length > 1) {
    doc.setLineWidth(0.5);
    setColor(doc, C.primary);
    for (let i = 1; i < data.fitCurve.length; i++) {
      const p0 = data.fitCurve[i - 1], p1 = data.fitCurve[i];
      doc.line(mapX(p0.w), mapY(p0.gammaD), mapX(p1.w), mapY(p1.gammaD));
    }
  }

  // Data points (circles)
  for (const pt of data.points) {
    setColor(doc, C.primary);
    setFill(doc, C.white);
    doc.circle(mapX(pt.waterContent), mapY(pt.dryDensity), 1.2, "FD");
  }

  // wopt and γd_max lines
  doc.setLineWidth(0.3);
  setColor(doc, C.red);
  dashedLine(doc, mapX(data.optimumWaterContent), oy, mapX(data.optimumWaterContent), oy + ph);
  dashedLine(doc, ox, mapY(data.maxDryDensity), ox + pw, mapY(data.maxDryDensity));
  // Labels
  doc.setFontSize(5);
  setText(doc, C.red);
  doc.text(`wopt=${data.optimumWaterContent.toFixed(1)}%`, mapX(data.optimumWaterContent) + 1, oy + 4);
  doc.text(`γd_max=${data.maxDryDensity.toFixed(2)}`, ox + pw - 20, mapY(data.maxDryDensity) - 1.5);

  // 95% γd_max line
  if (data.gammaD95 >= syG.min) {
    doc.setLineWidth(0.2);
    setColor(doc, C.orange);
    dashedLine(doc, ox, mapY(data.gammaD95), ox + pw, mapY(data.gammaD95));
    doc.setFontSize(5);
    setText(doc, C.orange);
    doc.text(`95% γd_max=${data.gammaD95.toFixed(2)}`, ox + 2, mapY(data.gammaD95) - 1);
  }

  // Axis labels
  const xLabels: string[] = [];
  for (let v = sxW.min; v <= sxW.max + 0.01; v += sxW.step) xLabels.push(v.toFixed(0));
  labelXAxis(doc, xLabels, ox, oy, pw, ph);
  axisTitle(doc, "Su Muhtevasi w (%)", ox + pw / 2, oy + ph + 8);

  const yLabels: string[] = [];
  for (let v = syG.min; v <= syG.max + 0.01; v += syG.step) yLabels.push(v.toFixed(1));
  labelYAxis(doc, [...yLabels].reverse(), ox, oy, pw, ph);
  axisTitle(doc, "γd (kN/m³)", ox - 14, oy + ph / 2, true);

  drawLegend(doc, [
    { label: "Proctor egrisi", color: C.primary },
    { label: "ZAV", color: C.gray, dashed: true },
  ], ox, oy + ph + 12);
  y = oy + ph + 17;
  y = drawRef(doc, "Referans: ASTM D698 / D1557", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 11. Mohr Dairesi
// ═══════════════════════════════════════════════════════════════

export function drawMohrCircleChart(doc: jsPDF, data: MohrCircleChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Mohr Dairesi & Yenilme Zarfi", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const { sigma1, sigma3, center, radius, cohesion: c, frictionAngle: phi } = data;
  const maxSigma = sigma1 * 1.3;
  const maxTau = radius * 1.5;
  const sxS = niceScale(Math.min(0, sigma3 - radius * 0.3), maxSigma, 5);
  const syT = niceScale(0, maxTau, 4);

  // Draw axes at tau=0
  const zeroY = oy + ph; // tau=0 is at bottom
  doc.setLineWidth(0.3);
  setColor(doc, C.dark);
  doc.line(ox, zeroY, ox + pw, zeroY); // sigma axis
  doc.line(ox, oy, ox, zeroY); // tau axis

  drawGrid(doc, ox, oy, pw, ph, 5, 4);

  const mapX = (s: number) => ox + ((s - sxS.min) / (sxS.max - sxS.min)) * pw;
  const mapY = (t: number) => zeroY - (t / syT.max) * ph;

  // Mohr circle (upper half)
  doc.setLineWidth(0.5);
  setColor(doc, C.primary);
  const steps = 50;
  for (let i = 0; i < steps; i++) {
    const a1 = (i / steps) * Math.PI;
    const a2 = ((i + 1) / steps) * Math.PI;
    const s1 = center + radius * Math.cos(a1), t1 = radius * Math.sin(a1);
    const s2 = center + radius * Math.cos(a2), t2 = radius * Math.sin(a2);
    doc.line(mapX(s1), mapY(t1), mapX(s2), mapY(t2));
  }

  // σ1, σ3 markers
  setFill(doc, C.primary);
  doc.circle(mapX(sigma3), zeroY, 1, "F");
  doc.circle(mapX(sigma1), zeroY, 1, "F");
  doc.setFontSize(5);
  setText(doc, C.primary);
  doc.text(`σ3=${sigma3.toFixed(0)}`, mapX(sigma3), zeroY + 3.5, { align: "center" });
  doc.text(`σ1=${sigma1.toFixed(0)}`, mapX(sigma1), zeroY + 3.5, { align: "center" });

  // Mohr-Coulomb failure envelope
  if (c !== undefined && phi !== undefined) {
    const phiRad = (phi * Math.PI) / 180;
    doc.setLineWidth(0.4);
    setColor(doc, C.red);
    const envX0 = sxS.min;
    const envX1 = sxS.max;
    const envY0 = c + envX0 * Math.tan(phiRad);
    const envY1 = c + envX1 * Math.tan(phiRad);
    if (envY0 >= 0 && envY1 >= 0) {
      doc.line(mapX(envX0), mapY(Math.max(envY0, 0)), mapX(envX1), mapY(envY1));
    }

    // c and φ labels
    doc.setFontSize(6);
    setText(doc, C.red);
    doc.text(`c = ${c.toFixed(1)} kPa`, ox + pw - 30, oy + 5);
    doc.text(`φ = ${phi.toFixed(1)}°`, ox + pw - 30, oy + 10);

    // τ = c + σ·tan(φ) label
    doc.setFontSize(5);
    doc.setFont("helvetica", "italic");
    doc.text("τ = c + σ·tan(φ)", ox + pw - 30, oy + 14);
  }

  // Axis labels
  const xLabels: string[] = [];
  for (let v = sxS.min; v <= sxS.max + 0.01; v += sxS.step) xLabels.push(v.toFixed(0));
  labelXAxis(doc, xLabels, ox, oy, pw, ph);
  axisTitle(doc, "σ (kPa)", ox + pw / 2, zeroY + 8);

  const yLabels: string[] = [];
  for (let v = 0; v <= syT.max + 0.01; v += syT.step) yLabels.push(v.toFixed(0));
  labelYAxis(doc, [...yLabels].reverse(), ox, oy, pw, ph);
  axisTitle(doc, "τ (kPa)", ox - 14, oy + ph / 2, true);

  drawLegend(doc, [
    { label: "Mohr dairesi", color: C.primary },
    { label: "Yenilme zarfi", color: C.red },
  ], ox, zeroY + 11);
  y = zeroY + 16;
  y = drawRef(doc, "Referans: Mohr-Coulomb Yenilme Kriteri", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 12. İksa Basınç Diyagramı
// ═══════════════════════════════════════════════════════════════

export function drawExcavationPressureChart(doc: jsPDF, data: ExcavationPressureChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Iksa Basinc Diyagrami", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const diagram = data.pressureDiagram;
  if (!diagram.length) return y + h;

  const totalL = data.excavationDepth + data.embedmentDepth;
  const maxP = Math.max(...diagram.map(d => Math.max(d.active, d.passive)), 1);
  const sy = niceScale(0, totalL, 5);
  const sx = niceScale(0, maxP, 4);

  // Wall in center
  const wallX = ox + pw * 0.45;
  const pressW = pw * 0.35;

  drawGrid(doc, ox, oy, pw, ph, 5, 5);

  const mapY = (d: number) => oy + ((d - sy.min) / (sy.max - sy.min)) * ph;

  // Wall rectangle
  setFill(doc, C.dark);
  doc.rect(wallX - 1.5, oy, 3, ph, "F");

  // Excavation depth line
  const excY = mapY(data.excavationDepth);
  doc.setLineWidth(0.3);
  setColor(doc, C.brown);
  dashedLine(doc, ox, excY, ox + pw, excY);
  doc.setFontSize(5);
  setText(doc, C.brown);
  doc.text("Kazi tabani", ox + pw - 15, excY - 1);

  // Active pressure (left)
  doc.setLineWidth(0.4);
  setColor(doc, C.red);
  for (let i = 0; i < diagram.length - 1; i++) {
    const y1 = mapY(diagram[i].depth);
    const y2 = mapY(diagram[i + 1].depth);
    const x1 = wallX - 3 - (diagram[i].active / sx.max) * pressW;
    const x2 = wallX - 3 - (diagram[i + 1].active / sx.max) * pressW;
    doc.line(x1, y1, x2, y2);
  }

  // Passive pressure (right, below excavation)
  setColor(doc, C.green);
  for (let i = 0; i < diagram.length - 1; i++) {
    if (diagram[i].passive > 0 || diagram[i + 1].passive > 0) {
      const y1 = mapY(diagram[i].depth);
      const y2 = mapY(diagram[i + 1].depth);
      const x1 = wallX + 3 + (diagram[i].passive / sx.max) * pressW;
      const x2 = wallX + 3 + (diagram[i + 1].passive / sx.max) * pressW;
      doc.line(x1, y1, x2, y2);
    }
  }

  // Support levels (struts/anchors)
  const supports = data.supportLevels || [];
  for (let i = 0; i < supports.length; i++) {
    const sY = mapY(supports[i]);
    doc.setLineWidth(0.5);
    setColor(doc, C.orange);
    // Arrow
    doc.line(wallX + 3, sY, wallX + 15, sY);
    doc.line(wallX + 13, sY - 1.5, wallX + 15, sY);
    doc.line(wallX + 13, sY + 1.5, wallX + 15, sY);
    // Force label
    if (data.anchorForces[i] !== undefined) {
      doc.setFontSize(5);
      setText(doc, C.orange);
      doc.text(`T${i + 1}=${data.anchorForces[i].toFixed(0)} kN/m`, wallX + 16, sY + 0.5);
    }
  }

  // Ka, Kp labels
  doc.setFontSize(6);
  setText(doc, C.red);
  doc.text(`Ka=${data.Ka.toFixed(3)}`, ox + 2, oy + 5);
  setText(doc, C.green);
  doc.text(`Kp=${data.Kp.toFixed(3)}`, ox + pw - 18, oy + 5);

  // Y axis labels
  const yLabels: string[] = [];
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) yLabels.push(v.toFixed(1));
  labelYAxis(doc, yLabels, ox, oy, pw, ph);
  axisTitle(doc, "Derinlik (m)", ox - 14, oy + ph / 2, true);

  drawLegend(doc, [
    { label: "Aktif", color: C.red },
    { label: "Pasif", color: C.green },
    { label: "Destek", color: C.orange },
  ], ox, oy + ph + 5);
  y = oy + ph + 10;
  y = drawRef(doc, "Referans: Peck, 1969 / Blum Yontemi", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 13. Kazık Yük Transfer Diyagramı
// ═══════════════════════════════════════════════════════════════

export function drawPileLoadTransferChart(doc: jsPDF, data: PileLoadTransferChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, `Kazik Yuk Transferi (Qu=${data.ultimate.toFixed(0)} kN)`, x, y, w);

  const pad = { l: 5, r: 5, t: 3, b: 10 };
  const oy = y + pad.t;
  const ph = h - pad.t - pad.b;
  const pileW = (w - pad.l - pad.r) * 0.35;
  const chartW = (w - pad.l - pad.r) * 0.55;
  const oxPile = x + pad.l;
  const oxChart = oxPile + pileW + 8;

  const layers = data.layers;
  if (!layers.length) return y + h;

  const maxD = data.pileLength;
  const maxQs = Math.max(...layers.map(l => l.qs), 1);
  const sy = niceScale(0, maxD, 5);
  const sxQ = niceScale(0, maxQs, 4);

  const mapY = (d: number) => oy + ((d - sy.min) / (sy.max - sy.min)) * ph;

  // ── Left: Pile cross-section with layers ──
  const pileX = oxPile + pileW * 0.3;
  const pilePxW = pileW * 0.25;

  // Pile shaft
  setFill(doc, [200, 200, 200] as RGB);
  doc.rect(pileX, oy, pilePxW, ph * (maxD / sy.max), "F");
  setColor(doc, C.dark);
  doc.setLineWidth(0.5);
  doc.rect(pileX, oy, pilePxW, ph * (maxD / sy.max), "S");

  // Layer fills
  const layerColors: Record<string, RGB> = {
    "Kil": [255, 224, 178] as RGB,
    "Kum": [200, 230, 201] as RGB,
    "clay": [255, 224, 178] as RGB,
    "sand": [200, 230, 201] as RGB,
  };
  for (const l of layers) {
    const ly1 = mapY(l.depthTop);
    const ly2 = mapY(l.depthBottom);
    const lType = l.type.includes("Kil") || l.type.includes("clay") ? "Kil" : "Kum";
    setFill(doc, layerColors[lType] || C.lightGray);
    doc.rect(oxPile, ly1, pileX - oxPile - 1, ly2 - ly1, "F");
    doc.rect(pileX + pilePxW + 1, ly1, pileW - (pileX - oxPile) - pilePxW - 2, ly2 - ly1, "F");

    // Layer label
    doc.setFontSize(4.5);
    setText(doc, C.dark);
    const midY = (ly1 + ly2) / 2;
    doc.text(l.type.substring(0, 15), oxPile + 1, midY + 0.5);
  }

  // Depth labels
  doc.setFontSize(5);
  setText(doc, C.dark);
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) {
    doc.text(v.toFixed(1), oxPile - 1, mapY(v) + 0.5, { align: "right" });
  }

  // ── Right: qs profile ──
  drawAxes(doc, oxChart, oy, chartW, ph);
  drawGrid(doc, oxChart, oy, chartW, ph, 4, 5);

  const mapXq = (qs: number) => oxChart + ((qs - sxQ.min) / (sxQ.max - sxQ.min)) * chartW;

  // qs bars
  for (const l of layers) {
    const ly1 = mapY(l.depthTop);
    const ly2 = mapY(l.depthBottom);
    const bw = ((l.qs - sxQ.min) / (sxQ.max - sxQ.min)) * chartW;
    setFill(doc, C.primary);
    doc.rect(oxChart, ly1, Math.max(bw, 0.5), ly2 - ly1, "F");

    // qs value
    doc.setFontSize(5);
    setText(doc, C.white);
    if (bw > 10) doc.text(`${l.qs.toFixed(1)}`, oxChart + bw / 2, (ly1 + ly2) / 2 + 0.5, { align: "center" });
  }

  // Tip capacity at bottom
  setFill(doc, C.red);
  const tipY = mapY(maxD);
  doc.rect(oxChart, tipY - 3, chartW * 0.6, 3, "F");
  doc.setFontSize(5);
  setText(doc, C.red);
  doc.text(`Qp = ${data.tipCapacity.toFixed(0)} kN`, oxChart + chartW * 0.65, tipY - 0.5);

  // Axis labels
  const xqLabels: string[] = [];
  for (let v = sxQ.min; v <= sxQ.max + 0.01; v += sxQ.step) xqLabels.push(v.toFixed(0));
  labelXAxis(doc, xqLabels, oxChart, oy, chartW, ph);
  axisTitle(doc, "qs (kPa)", oxChart + chartW / 2, oy + ph + 8);

  // Summary
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  setText(doc, C.dark);
  doc.text(`Qs=${data.shaftCapacity.toFixed(0)} kN | Qp=${data.tipCapacity.toFixed(0)} kN | Qu=${data.ultimate.toFixed(0)} kN`, oxChart, oy + ph + 13);

  y = oy + ph + 17;
  y = drawRef(doc, "Referans: α-β Yontemi / Meyerhof SPT", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 14. Zemin Profili (Sondaj Logu Tarzı)
// ═══════════════════════════════════════════════════════════════

export function drawSoilProfileChart(doc: jsPDF, data: SoilProfileChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Zemin Profili (Sondaj Logu)", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 5 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const layers = data.layers;
  if (!layers.length) return y + h;

  const totalD = data.totalDepth || layers[layers.length - 1].depthBottom;
  const colW = pw * 0.25; // hatch column width
  const labelX = ox + colW + 5;

  const mapY = (d: number) => oy + (d / totalD) * ph;

  // Hatch patterns per soil type
  for (const l of layers) {
    const ly1 = mapY(l.depthTop);
    const ly2 = mapY(l.depthBottom);
    const lh = ly2 - ly1;

    // Background fill
    const bgColors: Record<string, RGB> = {
      kil: [255, 235, 210] as RGB,
      silt: [255, 249, 196] as RGB,
      kum: [232, 245, 233] as RGB,
      cakil: [187, 222, 251] as RGB,
      kaya: [220, 220, 220] as RGB,
    };
    const st = l.soilType.toLowerCase();
    const bg = bgColors[st] || C.lightGray;
    setFill(doc, bg);
    doc.rect(ox, ly1, colW, lh, "F");

    // Hatch pattern
    doc.setLineWidth(0.1);
    setColor(doc, C.dark);
    if (st === "kil" || st === "clay") {
      // Horizontal lines
      for (let hy = ly1 + 1.5; hy < ly2; hy += 2.5) {
        doc.line(ox + 1, hy, ox + colW - 1, hy);
      }
    } else if (st === "kum" || st === "sand") {
      // Dots
      for (let dy = ly1 + 2; dy < ly2; dy += 3) {
        for (let dx = ox + 2; dx < ox + colW; dx += 3) {
          doc.circle(dx, dy, 0.3, "F");
        }
      }
    } else if (st === "cakil" || st === "gravel") {
      // Small circles
      for (let dy = ly1 + 2.5; dy < ly2; dy += 4) {
        for (let dx = ox + 3; dx < ox + colW; dx += 5) {
          setColor(doc, C.dark);
          doc.circle(dx, dy, 1, "S");
        }
      }
    } else if (st === "kaya" || st === "rock") {
      // Cross hatching
      for (let dy = ly1 + 2; dy < ly2; dy += 3) {
        for (let dx = ox + 2; dx < ox + colW; dx += 3) {
          doc.line(dx - 1, dy - 1, dx + 1, dy + 1);
          doc.line(dx - 1, dy + 1, dx + 1, dy - 1);
        }
      }
    }

    // Border
    setColor(doc, C.dark);
    doc.setLineWidth(0.2);
    doc.rect(ox, ly1, colW, lh, "S");

    // Layer name and thickness
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    setText(doc, C.dark);
    const midY = (ly1 + ly2) / 2;
    doc.text(l.name, labelX, midY - 1);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    setText(doc, C.gray);
    doc.text(`${l.depthTop.toFixed(1)} - ${l.depthBottom.toFixed(1)} m (${(l.depthBottom - l.depthTop).toFixed(1)} m)`, labelX, midY + 3);

    // Depth labels on left
    doc.setFontSize(5);
    setText(doc, C.dark);
    doc.text(l.depthTop.toFixed(1), ox - 1.5, ly1 + 1, { align: "right" });
  }
  // Bottom depth
  doc.setFontSize(5);
  setText(doc, C.dark);
  doc.text(totalD.toFixed(1), ox - 1.5, mapY(totalD) + 1, { align: "right" });

  // YASS triangle symbol
  if (data.waterTableDepth < totalD) {
    const wY = mapY(data.waterTableDepth);
    setFill(doc, C.cyan);
    setColor(doc, C.cyan);
    // Triangle
    const triSize = 2.5;
    doc.line(ox + colW + 1, wY, ox + colW + 1 + triSize, wY - triSize);
    doc.line(ox + colW + 1 + triSize, wY - triSize, ox + colW + 1 + triSize * 2, wY);
    doc.line(ox + colW + 1 + triSize * 2, wY, ox + colW + 1, wY);
    doc.setFontSize(5);
    setText(doc, C.cyan);
    doc.text(`YASS: ${data.waterTableDepth.toFixed(1)} m`, ox + colW + triSize * 2 + 3, wY + 0.5);
  }

  axisTitle(doc, "Derinlik (m)", ox - 14, oy + ph / 2, true);

  y = oy + ph + 3;
  y = drawRef(doc, "Referans: Sektor standardi sondaj logu formati", x, y, w);
  return y;
}

// ═══════════════════════════════════════════════════════════════
// 15. Schmertmann Strain Influence
// ═══════════════════════════════════════════════════════════════

export function drawSchmertmannChart(doc: jsPDF, data: SchmertmannChartData, x: number, y: number, w: number, h: number): number {
  y = pageCheck(doc, y, h + 20);
  y = drawTitle(doc, "Schmertmann Strain Influence Diyagrami", x, y, w);

  const pad = { l: 18, r: 5, t: 3, b: 10 };
  const ox = x + pad.l, oy = y + pad.t;
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;

  const contribs = data.contributions;
  if (!contribs.length) return y + h;

  const maxIz = Math.max(...contribs.map(c => c.Iz), 0.7);
  const maxD = data.zMax || Math.max(...contribs.map(c => c.depth), 1);
  const sxI = niceScale(0, maxIz, 4);
  const sy = niceScale(0, maxD, 5);

  drawAxes(doc, ox, oy, pw, ph);
  drawGrid(doc, ox, oy, pw, ph, 4, 5);

  const mapX = (iz: number) => ox + ((iz - sxI.min) / (sxI.max - sxI.min)) * pw;
  const mapY = (d: number) => oy + ((d - sy.min) / (sy.max - sy.min)) * ph;

  // Triangular distribution line
  doc.setLineWidth(0.5);
  setColor(doc, C.primary);

  // Build Iz profile: 0 at surface, peak at B/2 or B, 0 at zMax
  const B = data.width;
  const isSquare = maxD <= 2.5 * B;
  const zPeak = isSquare ? 0.5 * B : B;
  const Iz0 = isSquare ? 0.1 : 0.2;
  const IzPeak = 0.6;

  // Draw theoretical Iz line
  const izPoints = [
    { z: 0, iz: Iz0 },
    { z: zPeak, iz: IzPeak },
    { z: maxD, iz: 0 },
  ];
  for (let i = 1; i < izPoints.length; i++) {
    doc.line(mapX(izPoints[i - 1].iz), mapY(izPoints[i - 1].z), mapX(izPoints[i].iz), mapY(izPoints[i].z));
  }

  // Fill under Iz curve
  setFill(doc, [220, 230, 255] as RGB);
  doc.rect(ox, oy, mapX(Iz0) - ox, mapY(zPeak) - oy, "F"); // rough fill

  // Data points
  for (const c of contribs) {
    setFill(doc, C.primary);
    doc.circle(mapX(c.Iz), mapY(c.depth), 1, "F");

    // Es label
    doc.setFontSize(5);
    setText(doc, C.dark);
    doc.text(`Es=${c.Es}`, mapX(c.Iz) + 2, mapY(c.depth) + 0.5);
  }

  // Layer boundaries
  doc.setLineWidth(0.15);
  setColor(doc, C.gray);
  for (const c of contribs) {
    dashedLine(doc, ox, mapY(c.depth), ox + pw, mapY(c.depth));
  }

  // Axis labels
  const xLabels: string[] = [];
  for (let v = sxI.min; v <= sxI.max + 0.001; v += sxI.step) xLabels.push(v.toFixed(2));
  labelXAxis(doc, xLabels, ox, oy, pw, ph);
  axisTitle(doc, "Iz (strain influence)", ox + pw / 2, oy + ph + 8);

  const yLabels: string[] = [];
  for (let v = sy.min; v <= sy.max + 0.01; v += sy.step) yLabels.push(v.toFixed(1));
  labelYAxis(doc, yLabels, ox, oy, pw, ph);
  axisTitle(doc, "Derinlik (m)", ox - 14, oy + ph / 2, true);

  y = oy + ph + 12;
  y = drawRef(doc, "Referans: Schmertmann, 1978", x, y, w);
  return y;
}
