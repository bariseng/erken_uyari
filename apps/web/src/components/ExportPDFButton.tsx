"use client";
import { useCallback } from "react";
import { generateReport, createGenericReport } from "@/lib/report-generator";
import type { ReportProject } from "@/lib/report-generator";

interface ExportPDFButtonProps {
  moduleName: string;
  method: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  className?: string;
}

const defaultProject: ReportProject = {
  projectName: "GeoForce Hesap Raporu",
  projectLocation: "-",
  projectOwner: "-",
  reportDate: new Date().toLocaleDateString("tr-TR"),
  reportNo: `GF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  engineer: "-",
  company: "GeoForce",
};

export default function ExportPDFButton({ moduleName, method, inputs, results, className }: ExportPDFButtonProps) {
  const handleExport = useCallback(() => {
    try {
      const config = createGenericReport(defaultProject, moduleName, inputs, results, method);
      const doc = generateReport(config);
      doc.save(`GeoForce_${moduleName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF hatası:", err);
    }
  }, [moduleName, method, inputs, results]);

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors ${className ?? ""}`}
    >
      📄 PDF İndir
    </button>
  );
}
