/**
 * GeoForce — PDF Rapor Üretici
 * Geoteknik mühendislik raporu şablonu
 *
 * Türk geoteknik rapor standartlarına uygun:
 * - TBDY 2018 referansları
 * - Zemin etüdü rapor formatı
 * - Hesap detayları ve formüller
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Rapor Veri Yapıları ───

export interface ReportProject {
  projectName: string;
  projectLocation: string;
  projectOwner: string;
  reportDate: string;
  reportNo: string;
  engineer: string;
  company?: string;
  companyLogo?: string; // base64
}

export interface ReportSection {
  title: string;
  type: "text" | "table" | "calculation" | "chart-placeholder";
  content?: string;
  tableData?: { headers: string[]; rows: string[][] };
  calcData?: {
    method: string;
    inputs: { label: string; value: string; unit: string }[];
    formula?: string;
    results: { label: string; value: string; unit: string; highlight?: boolean }[];
    notes?: string[];
  };
}

export interface ReportConfig {
  project: ReportProject;
  sections: ReportSection[];
  includeDisclaimer?: boolean;
  language?: "tr" | "en";
}

// ─── Renkler & Stiller ───

const COLORS = {
  primary: [41, 98, 255] as [number, number, number],
  dark: [30, 30, 30] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  lightGray: [240, 240, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  accent: [0, 150, 136] as [number, number, number],
  warning: [255, 152, 0] as [number, number, number],
  headerBg: [41, 98, 255] as [number, number, number],
  tableBg: [245, 247, 250] as [number, number, number],
};

// ─── PDF Üretici ───

export function generateReport(config: ReportConfig): jsPDF {
  const { project, sections, includeDisclaimer = true, language = "tr" } = config;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - 2 * margin;
  let y = 0;

  // ─── Kapak Sayfası ───
  drawCoverPage(doc, project, pageW, pageH, margin);
  doc.addPage();

  // ─── İçindekiler ───
  y = drawHeader(doc, project, margin, pageW);
  y = drawTableOfContents(doc, sections, y, margin, contentW);
  doc.addPage();

  // ─── Bölümler ───
  let sectionNum = 1;
  for (const section of sections) {
    y = drawHeader(doc, project, margin, pageW);

    // Bölüm başlığı
    y = drawSectionTitle(doc, `${sectionNum}. ${section.title}`, y, margin, contentW);

    if (section.type === "text" && section.content) {
      y = drawText(doc, section.content, y, margin, contentW);
    } else if (section.type === "table" && section.tableData) {
      y = drawTable(doc, section.tableData, y, margin, contentW);
    } else if (section.type === "calculation" && section.calcData) {
      y = drawCalculation(doc, section.calcData, y, margin, contentW);
    } else if (section.type === "chart-placeholder") {
      y = drawChartPlaceholder(doc, section.title, y, margin, contentW);
    }

    // Sayfa altı
    drawFooter(doc, project, pageW, pageH, margin);

    if (sectionNum < sections.length) {
      doc.addPage();
    }
    sectionNum++;
  }

  // ─── Sorumluluk Reddi ───
  if (includeDisclaimer) {
    doc.addPage();
    y = drawHeader(doc, project, margin, pageW);
    y = drawSectionTitle(doc, language === "tr" ? "Sorumluluk Reddi" : "Disclaimer", y, margin, contentW);
    const disclaimerText = language === "tr"
      ? "Bu rapor, GeoForce platformu kullanılarak otomatik olarak üretilmiştir. Rapordaki hesaplamalar, girilen parametrelere ve seçilen yöntemlere dayanmaktadır. Sonuçlar, yetkili bir geoteknik mühendis tarafından kontrol edilmeli ve onaylanmalıdır. Rapor, kesin mühendislik kararları için tek başına yeterli değildir; saha koşulları, laboratuvar deneyleri ve mühendislik yargısı ile birlikte değerlendirilmelidir. GeoForce, bu raporun kullanımından doğabilecek herhangi bir zarardan sorumlu tutulamaz."
      : "This report was automatically generated using the GeoForce platform. Calculations are based on the input parameters and selected methods. Results should be reviewed and approved by a qualified geotechnical engineer. This report alone is not sufficient for definitive engineering decisions; it should be evaluated together with field conditions, laboratory tests, and engineering judgment.";
    y = drawText(doc, disclaimerText, y, margin, contentW);
    drawFooter(doc, project, pageW, pageH, margin);
  }

  return doc;
}

// ─── Kapak Sayfası ───

function drawCoverPage(doc: jsPDF, project: ReportProject, pageW: number, pageH: number, margin: number) {
  // Üst bant
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 60, "F");

  // Logo / Marka
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("GeoForce", pageW / 2, 30, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Geoteknik Hesaplama Platformu", pageW / 2, 42, { align: "center" });

  // Proje adı
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(project.projectName, pageW / 2, 100, { align: "center", maxWidth: pageW - 40 });

  // Alt başlık
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray);
  doc.text("Geoteknik Hesap Raporu", pageW / 2, 120, { align: "center" });

  // Bilgi kutusu
  const boxY = 150;
  const boxH = 80;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin + 20, boxY, pageW - 2 * margin - 40, boxH, 3, 3, "F");

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  const infoX = margin + 30;
  let infoY = boxY + 15;
  const lineH = 12;

  const infoPairs = [
    ["Proje Yeri:", project.projectLocation],
    ["Proje Sahibi:", project.projectOwner],
    ["Rapor No:", project.reportNo],
    ["Rapor Tarihi:", project.reportDate],
    ["Sorumlu Muhendis:", project.engineer],
  ];

  for (const [label, value] of infoPairs) {
    doc.setFont("helvetica", "bold");
    doc.text(label, infoX, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(value, infoX + 45, infoY);
    infoY += lineH;
  }

  if (project.company) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    doc.text(project.company, pageW / 2, boxY + boxH + 20, { align: "center" });
  }

  // Alt bant
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, pageH - 15, pageW, 15, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.text("GeoForce - geoforce.app", pageW / 2, pageH - 5, { align: "center" });
}

// ─── Başlık ───

function drawHeader(doc: jsPDF, project: ReportProject, margin: number, pageW: number): number {
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("GeoForce", margin, 12);
  doc.setFont("helvetica", "normal");
  doc.text(`${project.reportNo} | ${project.projectName}`, pageW - margin, 12, { align: "right" });
  return 30;
}

// ─── Altbilgi ───

function drawFooter(doc: jsPDF, project: ReportProject, pageW: number, pageH: number, margin: number) {
  const pageNum = (doc as any).internal.getNumberOfPages();
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(7);
  doc.text(`${project.company || "GeoForce"} | ${project.reportDate}`, margin, pageH - 8);
  doc.text(`Sayfa ${pageNum}`, pageW - margin, pageH - 8, { align: "right" });
}

// ─── İçindekiler ───

function drawTableOfContents(doc: jsPDF, sections: ReportSection[], y: number, margin: number, contentW: number): number {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Icindekiler", margin, y);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  sections.forEach((s, i) => {
    doc.setTextColor(...COLORS.dark);
    doc.text(`${i + 1}. ${s.title}`, margin + 5, y);
    // Noktalı çizgi
    doc.setTextColor(...COLORS.gray);
    const dots = ".".repeat(60);
    doc.text(dots, margin + 80, y, { maxWidth: contentW - 90 });
    doc.text(`${i + 3}`, margin + contentW - 5, y, { align: "right" });
    y += 8;
  });

  return y + 5;
}

// ─── Bölüm Başlığı ───

function drawSectionTitle(doc: jsPDF, title: string, y: number, margin: number, contentW: number): number {
  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, y - 5, contentW, 10, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin + 5, y + 2);
  return y + 15;
}

// ─── Metin ───

function drawText(doc: jsPDF, text: string, y: number, margin: number, contentW: number): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, contentW);
  doc.text(lines, margin, y);
  return y + lines.length * 5 + 5;
}

// ─── Tablo ───

function drawTable(doc: jsPDF, data: { headers: string[]; rows: string[][] }, y: number, margin: number, _contentW: number): number {
  autoTable(doc, {
    startY: y,
    head: [data.headers],
    body: data.rows,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: COLORS.dark },
    alternateRowStyles: { fillColor: COLORS.tableBg },
    styles: { cellPadding: 3 },
  });
  return (doc as any).lastAutoTable.finalY + 10;
}

// ─── Hesap Detayı ───

function drawCalculation(doc: jsPDF, calc: NonNullable<ReportSection["calcData"]>, y: number, margin: number, contentW: number): number {
  // Yöntem adı
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, y - 3, contentW, 10, 2, 2, "F");
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Yontem: ${calc.method}`, margin + 5, y + 4);
  y += 15;

  // Girdi parametreleri
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Girdi Parametreleri:", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Parametre", "Deger", "Birim"]],
    body: calc.inputs.map(i => [i.label, i.value, i.unit]),
    margin: { left: margin, right: margin + contentW / 2 },
    headStyles: { fillColor: COLORS.accent, textColor: COLORS.white, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 2 },
    tableWidth: contentW / 2,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Formül
  if (calc.formula) {
    doc.setFillColor(255, 252, 240);
    doc.roundedRect(margin, y - 3, contentW, 12, 2, 2, "F");
    doc.setDrawColor(...COLORS.warning);
    doc.roundedRect(margin, y - 3, contentW, 12, 2, 2, "S");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(calc.formula, margin + 5, y + 5);
    y += 18;
  }

  // Sonuçlar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Sonuclar:", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Sonuc", "Deger", "Birim"]],
    body: calc.results.map(r => [r.label, r.value, r.unit]),
    margin: { left: margin, right: margin },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 },
    didParseCell: (data: any) => {
      if (data.section === "body") {
        const result = calc.results[data.row.index];
        if (result?.highlight) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = COLORS.primary;
        }
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Notlar
  if (calc.notes && calc.notes.length > 0) {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    for (const note of calc.notes) {
      doc.text(`* ${note}`, margin, y);
      y += 4;
    }
    y += 3;
  }

  return y;
}

// ─── Grafik Placeholder ───

function drawChartPlaceholder(doc: jsPDF, title: string, y: number, margin: number, contentW: number): number {
  const h = 60;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, y, contentW, h, 3, 3, "F");
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(margin, y, contentW, h, 3, 3, "S");
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(10);
  doc.text(`[Grafik: ${title}]`, margin + contentW / 2, y + h / 2, { align: "center" });
  return y + h + 10;
}

// ─── Hazır Rapor Şablonları ───

export function createBearingCapacityReport(project: ReportProject, inputs: Record<string, any>, results: Record<string, any>): ReportConfig {
  return {
    project,
    sections: [
      {
        title: "Proje Tanimi ve Amac",
        type: "text",
        content: `Bu rapor, ${project.projectLocation} konumundaki ${project.projectName} projesi icin zemin tasima kapasitesi hesaplamalarini icermektedir. Hesaplamalar, sahada yapilan zemin etudunden elde edilen parametreler kullanilarak gerceklestirilmistir.`,
      },
      {
        title: "Zemin Parametreleri",
        type: "table",
        tableData: {
          headers: ["Parametre", "Sembol", "Deger", "Birim"],
          rows: [
            ["Kohezyonu", "c", String(inputs.cohesion ?? 0), "kPa"],
            ["Icsel surtunme acisi", "phi", String(inputs.frictionAngle ?? 0), "derece"],
            ["Birim hacim agirligi", "gamma", String(inputs.gamma ?? 18), "kN/m3"],
            ["Temel genisligi", "B", String(inputs.width ?? 2), "m"],
            ["Temel derinligi", "Df", String(inputs.depth ?? 1.5), "m"],
            ["Temel uzunlugu", "L", String(inputs.length ?? 2), "m"],
          ],
        },
      },
      {
        title: "Tasima Kapasitesi Hesabi",
        type: "calculation",
        calcData: {
          method: results.method || "Terzaghi",
          inputs: [
            { label: "Kohezyon c", value: String(inputs.cohesion ?? 0), unit: "kPa" },
            { label: "Surtunme acisi phi", value: String(inputs.frictionAngle ?? 0), unit: "derece" },
            { label: "Birim hacim agirligi gamma", value: String(inputs.gamma ?? 18), unit: "kN/m3" },
            { label: "Temel genisligi B", value: String(inputs.width ?? 2), unit: "m" },
            { label: "Temel derinligi Df", value: String(inputs.depth ?? 1.5), unit: "m" },
          ],
          formula: results.formula || "qu = c*Nc + gamma*Df*Nq + 0.5*gamma*B*Ngamma",
          results: [
            { label: "Nihai tasima kapasitesi (qu)", value: String(results.ultimate ?? "-"), unit: "kPa", highlight: true },
            { label: "Izin verilebilir tasima kapasitesi (qa)", value: String(results.allowable ?? "-"), unit: "kPa", highlight: true },
            { label: "Nc", value: String(results.Nc ?? "-"), unit: "-" },
            { label: "Nq", value: String(results.Nq ?? "-"), unit: "-" },
            { label: "Ngamma", value: String(results.Ngamma ?? "-"), unit: "-" },
          ],
          notes: [
            "Guvenlik katsayisi FS = 3.0 uygulanmistir.",
            `Referans: ${results.method || "Terzaghi (1943)"}`,
            "Hesaplamalar TBDY 2018 ile uyumludur.",
          ],
        },
      },
      {
        title: "Degerlendirme ve Oneriler",
        type: "text",
        content: `Yapilan hesaplamalar sonucunda, izin verilebilir tasima kapasitesi ${results.allowable ?? "-"} kPa olarak belirlenmistir. Bu deger, temel tasariminda kullanilabilir. Ancak, nihai tasarim icin saha kosullari, yeralti su seviyesi, deprem etkileri ve oturma analizleri de dikkate alinmalidir. Gerekli gorulmesi halinde ek sondaj ve laboratuvar deneyleri yapilmasi onerilmektedir.`,
      },
    ],
    includeDisclaimer: true,
    language: "tr",
  };
}

export function createSettlementReport(project: ReportProject, inputs: Record<string, any>, results: Record<string, any>): ReportConfig {
  return {
    project,
    sections: [
      {
        title: "Proje Tanimi",
        type: "text",
        content: `${project.projectName} projesi icin oturma analizi raporu. Hesaplamalar ${results.method || "Elastik"} yontemi ile yapilmistir.`,
      },
      {
        title: "Zemin Profili ve Parametreler",
        type: "table",
        tableData: {
          headers: ["Parametre", "Deger", "Birim"],
          rows: Object.entries(inputs).map(([k, v]) => [k, String(v), ""]),
        },
      },
      {
        title: "Oturma Hesabi",
        type: "calculation",
        calcData: {
          method: results.method || "Elastik Oturma",
          inputs: Object.entries(inputs).map(([k, v]) => ({ label: k, value: String(v), unit: "" })),
          results: Object.entries(results)
            .filter(([k]) => k !== "method")
            .map(([k, v]) => ({ label: k, value: String(v), unit: "", highlight: k.includes("settlement") || k.includes("oturma") })),
          notes: ["Hesaplamalar GeoForce platformu ile yapilmistir."],
        },
      },
      {
        title: "Sonuc ve Oneriler",
        type: "text",
        content: "Hesaplanan oturma degerleri, izin verilebilir oturma sinirlari ile karsilastirilmalidir. Genel olarak, izin verilebilir toplam oturma 25mm, diferansiyel oturma ise L/500 ile sinirlandirilmaktadir.",
      },
    ],
  };
}

export function createGenericReport(project: ReportProject, moduleName: string, inputs: Record<string, any>, results: Record<string, any>, method: string): ReportConfig {
  return {
    project,
    sections: [
      {
        title: "Proje Bilgileri",
        type: "text",
        content: `Bu rapor, ${project.projectName} projesi icin ${moduleName} hesaplamalarini icermektedir. Konum: ${project.projectLocation}. Tarih: ${project.reportDate}.`,
      },
      {
        title: "Girdi Parametreleri",
        type: "table",
        tableData: {
          headers: ["Parametre", "Deger"],
          rows: Object.entries(inputs).map(([k, v]) => [k, String(v)]),
        },
      },
      {
        title: `${moduleName} Hesabi`,
        type: "calculation",
        calcData: {
          method,
          inputs: Object.entries(inputs).map(([k, v]) => ({ label: k, value: String(v), unit: "" })),
          results: Object.entries(results)
            .filter(([k]) => !["method", "slices", "layerDetails", "pressureDiagram", "circlePoints", "timeCurve", "comparison", "transferFunction", "profile", "fitCurve", "zavCurve"].includes(k))
            .map(([k, v]) => ({ label: k, value: typeof v === "number" ? v.toFixed(2) : String(v), unit: "", highlight: false })),
          notes: [`Yontem: ${method}`, "GeoForce platformu ile hesaplanmistir."],
        },
      },
      {
        title: "Degerlendirme",
        type: "text",
        content: "Yukaridaki hesap sonuclari, yetkili bir geoteknik muhendis tarafindan degerlendirilmeli ve onaylanmalidir. Sonuclar, saha kosullari ve laboratuvar deneyleri ile birlikte yorumlanmalidir.",
      },
    ],
    includeDisclaimer: true,
  };
}
