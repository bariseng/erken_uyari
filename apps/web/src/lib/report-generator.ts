/**
 * GeoForce — PDF Rapor Üretici
 * Geoteknik mühendislik raporu şablonu
 *
 * Türk geoteknik rapor standartlarına uygun:
 * - TBDY 2018 referansları
 * - Zemin etüdü rapor formatı
 * - Yeşil tema renk paleti
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawChart } from "./report-charts";
import type { ChartData } from "./report-charts";

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
  buildingType?: string;
  seismicZone?: string;
  projectDescription?: string;
  drillingRef?: string;
}

export interface ReportSection {
  title: string;
  type: "text" | "table" | "calculation" | "chart-placeholder" | "chart";
  content?: string;
  tableData?: { headers: string[]; rows: string[][] };
  calcData?: {
    method: string;
    inputs: { label: string; value: string; unit: string }[];
    formula?: string;
    results: { label: string; value: string; unit: string; highlight?: boolean }[];
    notes?: string[];
  };
  chartData?: ChartData;
}

export interface ReportConfig {
  project: ReportProject;
  sections: ReportSection[];
  includeDisclaimer?: boolean;
  language?: "tr" | "en";
}

// ─── Renkler & Stiller (Yeşil Tema) ───

const COLORS = {
  // Ana renkler
  primary: [21, 128, 61] as [number, number, number],      // #15803d koyu yeşil - başlık
  accent: [34, 197, 94] as [number, number, number],       // #22c55e açık yeşil - vurgu
  dark: [28, 25, 23] as [number, number, number],          // #1c1917 metin
  gray: [100, 100, 100] as [number, number, number],       // gri
  lightGray: [240, 240, 240] as [number, number, number],  // açık gri
  white: [255, 255, 255] as [number, number, number],      // beyaz
  
  // Tablo renkleri
  headerBg: [22, 101, 52] as [number, number, number],     // #166534 tablo başlık
  tableBg: [240, 253, 244] as [number, number, number],     // #f0fdf4 tablo satır alternatif
  tableRowAlt: [248, 250, 248] as [number, number, number], // alternatif satır
  
  // Uyarı renkleri
  warning: [255, 152, 0] as [number, number, number],       // turuncu
  critical: [239, 68, 68] as [number, number, number],      // kırmızı
  criticalBg: [254, 242, 242] as [number, number, number],  // kırmızı arkaplan
  infoBg: [239, 246, 255] as [number, number, number],      // mavi arkaplan
  
  // Zemin tipleri
  clay: [194, 120, 3] as [number, number, number],          // turuncu - kil
  sand: [234, 179, 8] as [number, number, number],          // sarı - kum
  gravel: [107, 114, 128] as [number, number, number],      // gri - çakıl
  rock: [75, 85, 99] as [number, number, number],           // koyu gri - kaya
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
  let pageNum = 1;

  // ─── Kapak Sayfası ───
  drawCoverPage(doc, project, pageW, pageH, margin);
  pageNum++;

  // ─── İçindekiler ───
  doc.addPage();
  y = drawHeader(doc, project, margin, pageW, pageNum);
  y = drawTableOfContents(doc, sections, y, margin, contentW);
  drawFooter(doc, project, pageW, pageH, margin, pageNum);
  pageNum++;

  // ─── Bölümler ───
  let sectionNum = 1;
  for (const section of sections) {
    doc.addPage();
    y = drawHeader(doc, project, margin, pageW, pageNum);

    // Bölüm başlığı
    y = drawSectionTitle(doc, `${sectionNum}. ${section.title}`, y, margin, contentW);

    if (section.type === "text" && section.content) {
      y = drawText(doc, section.content, y, margin, contentW);
    } else if (section.type === "table" && section.tableData) {
      y = drawTable(doc, section.tableData, y, margin, contentW, sectionNum);
    } else if (section.type === "calculation" && section.calcData) {
      y = drawCalculation(doc, section.calcData, y, margin, contentW, sectionNum);
    } else if (section.type === "chart" && section.chartData) {
      y = drawChart(doc, section.chartData, margin, y, contentW, 90);
    }

    drawFooter(doc, project, pageW, pageH, margin, pageNum);
    pageNum++;
    sectionNum++;
  }

  // ─── Sorumluluk Reddi ───
  if (includeDisclaimer) {
    doc.addPage();
    y = drawHeader(doc, project, margin, pageW, pageNum);
    y = drawSectionTitle(doc, language === "tr" ? "Sorumluluk Reddi" : "Disclaimer", y, margin, contentW);
    
    const disclaimerText = language === "tr"
      ? `Bu rapor, GeoForce platformu kullanılarak otomatik olarak üretilmiştir. Rapordaki hesaplamalar, girilen parametrelere ve seçilen yöntemlere dayanmaktadır.

SONUÇLAR, YETKİLİ BİR GEOTEKNİK MÜHENDİSİ TARAFINDAN KONTROL EDİLMELİ VE ONAYLANMALIDIR.

Rapor, kesin mühendislik kararları için tek başına yeterli değildir; saha koşulları, laboratuvar deneyleri ve mühendislik yargısı ile birlikte değerlendirilmelidir.

GeoForce, bu raporun kullanımından doğabilecek herhangi bir zarardan sorumlu tutulamaz. Tüm hesaplamalar ilgili standart ve yönetmeliklere (TBDY 2018, vb.) uygun olarak yapılmış olsa da, nihai sorumluluk projeyi onaylayan yetkili mühendise aittir.`
      : "This report was automatically generated using the GeoForce platform. Results should be reviewed and approved by a qualified geotechnical engineer.";
    
    y = drawText(doc, disclaimerText, y, margin, contentW);
    
    // İmza alanı
    y += 20;
    doc.setDrawColor(...COLORS.gray);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + 60, y);
    
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    doc.text("Sorumlu Mühendis", margin, y + 5);
    doc.text(project.engineer, margin, y + 10);
    
    drawFooter(doc, project, pageW, pageH, margin, pageNum);
  }

  return doc;
}

// ─── Kapak Sayfası ───

function drawCoverPage(doc: jsPDF, project: ReportProject, pageW: number, pageH: number, margin: number) {
  // Üst yeşil bant
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 60, "F");

  // Logo veya GeoForce yazısı
  if (project.companyLogo) {
    try {
      doc.addImage(project.companyLogo, "PNG", margin, 15, 40, 30);
    } catch {
      // Logo yüklenemezse varsayılan
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("GeoForce", pageW / 2, 30, { align: "center" });
    }
  } else {
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("GeoForce", pageW / 2, 30, { align: "center" });
  }
  
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
  const boxH = 90;
  doc.setFillColor(...COLORS.tableBg);
  doc.roundedRect(margin + 15, boxY, pageW - 2 * margin - 30, boxH, 3, 3, "F");

  // Sol kolon
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  const leftX = margin + 25;
  let infoY = boxY + 12;
  const lineH = 10;

  const leftInfo = [
    ["Proje Yeri:", project.projectLocation],
    ["Proje Sahibi:", project.projectOwner || "-"],
    ["Sondaj No:", project.drillingRef || "-"],
  ];

  for (const [label, value] of leftInfo) {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftX, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(value, leftX + 35, infoY);
    infoY += lineH;
  }

  // Sağ kolon
  const rightX = margin + 95;
  infoY = boxY + 12;

  const rightInfo = [
    ["Rapor No:", project.reportNo],
    ["Rapor Tarihi:", project.reportDate],
    ["Sorumlu Mühendis:", project.engineer],
  ];

  for (const [label, value] of rightInfo) {
    doc.setFont("helvetica", "bold");
    doc.text(label, rightX, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(value, rightX + 40, infoY);
    infoY += lineH;
  }

  // Firma adı
  if (project.company) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    doc.text(project.company, pageW / 2, boxY + boxH + 15, { align: "center" });
  }

  // Alt yeşil bant
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, pageH - 20, pageW, 20, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.text("Bu rapor GeoForce platformu ile hazırlanmıştır | TBDY 2018 Uyumlu", pageW / 2, pageH - 7, { align: "center" });

  // Kenarlık çizgileri
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.8);
  doc.line(margin - 5, 60, pageW - margin + 5, 60);
  doc.line(margin - 5, pageH - 20, pageW - margin + 5, pageH - 20);
}

// ─── Başlık ───

function drawHeader(doc: jsPDF, project: ReportProject, margin: number, pageW: number, pageNum?: number): number {
  // Yeşil header bandı
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 15, "F");
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(project.projectName, margin, 10);
  doc.text(`${project.reportNo}`, pageW - margin, 10, { align: "right" });
  
  return 25;
}

// ─── Altbilgi ───

function drawFooter(doc: jsPDF, project: ReportProject, pageW: number, pageH: number, margin: number, currentPage: number) {
  const totalPages = (doc as any).internal.getNumberOfPages();
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(7);
  doc.text(`${project.company || "GeoForce"} | TBDY 2018 Uyumlu`, margin, pageH - 6);
  doc.text(`Sayfa ${currentPage}`, pageW - margin, pageH - 6, { align: "right" });
}

// ─── İçindekiler ───

function drawTableOfContents(doc: jsPDF, sections: ReportSection[], y: number, margin: number, contentW: number): number {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("İçindekiler", margin, y);
  y += 10;

  const entries: { num: number; title: string }[] = [
    { num: 1, title: "Proje Tanımı ve Amaç" },
  ];
  
  let num = 2;
  for (const section of sections) {
    entries.push({ num, title: section.title });
    num++;
  }
  
  entries.push({ num, title: "Genel Değerlendirme ve Öneriler" });
  entries.push({ num: num + 1, title: "Sorumluluk Reddi" });

  doc.setFontSize(10);
  for (const entry of entries) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    
    const text = `${entry.num}. ${entry.title}`;
    doc.text(text, margin + 5, y);
    
    // Noktalı çizgi
    const textW = doc.getTextWidth(text);
    doc.setTextColor(...COLORS.lightGray);
    const dots = ".".repeat(Math.floor((contentW - textW - 10) / 1.5));
    doc.text(dots, margin + 5 + textW + 2, y);
    
    // Sayfa numarası (tahmini)
    doc.setTextColor(...COLORS.gray);
    const pageEst = entry.num + 1;
    doc.text(String(pageEst), margin + contentW, y, { align: "right" });
    
    y += 7;
  }

  return y + 5;
}

// ─── Bölüm Başlığı ───

function drawSectionTitle(doc: jsPDF, title: string, y: number, margin: number, contentW: number): number {
  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, y - 4, contentW, 9, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin + 3, y + 2);
  return y + 12;
}

// ─── Metin ───

function drawText(doc: jsPDF, text: string, y: number, margin: number, contentW: number): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, contentW);
  
  // Sayfa kontrolü
  const pageH = 280;
  if (y + lines.length * 5 > pageH) {
    doc.addPage();
    y = 25;
  }
  
  doc.text(lines, margin, y);
  return y + lines.length * 5 + 5;
}

// ─── Tablo ───

function drawTable(doc: jsPDF, data: { headers: string[]; rows: string[][] }, y: number, margin: number, contentW: number, sectionNum?: number): number {
  // Sayfa kontrolü
  const pageH = 275;
  const estimatedH = 15 + data.rows.length * 8;
  
  if (y + estimatedH > pageH) {
    doc.addPage();
    y = 25;
  }

  autoTable(doc, {
    startY: y,
    head: [data.headers],
    body: data.rows,
    margin: { left: margin, right: margin },
    headStyles: { 
      fillColor: COLORS.headerBg, 
      textColor: COLORS.white, 
      fontStyle: "bold", 
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: { 
      fontSize: 9, 
      textColor: COLORS.dark,
    },
    alternateRowStyles: { 
      fillColor: COLORS.tableBg 
    },
    styles: { 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
    },
  });
  
  return (doc as any).lastAutoTable.finalY + 8;
}

// ─── Hesap Detayı ───

function drawCalculation(doc: jsPDF, calc: NonNullable<ReportSection["calcData"]>, y: number, margin: number, contentW: number, sectionNum?: number): number {
  const pageH = 275;
  
  // Yöntem adı
  doc.setFillColor(...COLORS.tableBg);
  doc.roundedRect(margin, y - 2, contentW, 8, 2, 2, "F");
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Yöntem: ${calc.method}`, margin + 3, y + 3);
  y += 12;

  // Girdi parametreleri
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Girdi Parametreleri:", margin, y);
  y += 5;

  if (y + 30 > pageH) {
    doc.addPage();
    y = 25;
  }

  autoTable(doc, {
    startY: y,
    head: [["Parametre", "Değer", "Birim"]],
    body: calc.inputs.map(i => [i.label, i.value, i.unit]),
    margin: { left: margin, right: margin + contentW / 2 },
    headStyles: { fillColor: COLORS.accent, textColor: COLORS.white, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 2 },
    tableWidth: contentW / 2,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // Formül varsa
  if (calc.formula) {
    doc.setFillColor(255, 252, 240);
    doc.roundedRect(margin, y - 2, contentW, 10, 2, 2, "F");
    doc.setDrawColor(...COLORS.warning);
    doc.roundedRect(margin, y - 2, contentW, 10, 2, 2, "S");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(calc.formula, margin + 3, y + 4);
    y += 14;
  }

  // Sonuçlar
  if (y + 40 > pageH) {
    doc.addPage();
    y = 25;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Hesap Sonuçları:", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Sonuç", "Değer", "Birim"]],
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
          
          // Kritik değerler için renkli arkaplan
          if (result.label.includes("FS") || result.label.includes("Güvenlik")) {
            const fs = parseFloat(result.value);
            if (fs < 1) {
              data.cell.styles.fillColor = COLORS.criticalBg;
              data.cell.styles.textColor = COLORS.critical;
            } else if (fs < 1.2) {
              data.cell.styles.fillColor = [255, 251, 235];
              data.cell.styles.textColor = COLORS.warning;
            }
          }
        }
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // Notlar
  if (calc.notes && calc.notes.length > 0) {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    for (const note of calc.notes) {
      if (note) {
        doc.text(`• ${note}`, margin, y);
        y += 4;
      }
    }
    y += 3;
  }

  return y;
}

// ─── Hazır Rapor Şablonları ───

export function createBearingCapacityReport(project: ReportProject, inputs: Record<string, any>, results: Record<string, any>): ReportConfig {
  return {
    project,
    sections: [
      {
        title: "Proje Tanımı ve Amaç",
        type: "text",
        content: `Bu rapor, ${project.projectLocation} konumundaki ${project.projectName} projesi için zemin taşıma kapasitesi hesaplamalarını içermektedir.`,
      },
      {
        title: "Taşıma Kapasitesi Hesabı",
        type: "calculation",
        calcData: {
          method: results.method || "Terzaghi",
          inputs: Object.entries(inputs).map(([k, v]) => ({ label: k, value: String(v), unit: "" })),
          results: Object.entries(results)
            .filter(([k]) => !k.startsWith("_"))
            .map(([k, v]) => ({
              label: k,
              value: typeof v === "number" ? v.toFixed(2) : String(v),
              unit: "",
              highlight: k.includes("ultimate") || k.includes("allowable"),
            })),
        },
      },
    ],
    includeDisclaimer: true,
    language: "tr",
  };
}

export function createGenericReport(project: ReportProject, moduleName: string, inputs: Record<string, any>, results: Record<string, any>, method: string, chartData?: ChartData | null): ReportConfig {
  const sections: ReportConfig["sections"] = [
    {
      title: "Proje Bilgileri",
      type: "text",
      content: `Bu rapor, ${project.projectName} projesi için ${moduleName} hesaplamalarını içermektedir.`,
    },
    {
      title: `${moduleName} Hesabı`,
      type: "calculation",
      calcData: {
        method,
        inputs: Object.entries(inputs).map(([k, v]) => ({ label: k, value: String(v), unit: "" })),
        results: Object.entries(results)
          .filter(([k]) => !k.startsWith("_"))
          .map(([k, v]) => ({ label: k, value: typeof v === "number" ? v.toFixed(2) : String(v), unit: "" })),
      },
    },
  ];

  if (chartData) {
    sections.push({ title: `${moduleName} Grafiği`, type: "chart", chartData });
  }

  return { project, sections, includeDisclaimer: true };
}
