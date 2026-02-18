/**
 * GeoForce — Rapor State Yönetimi (Zustand)
 * Çoklu hesap bölümü, proje bilgileri, PDF üretimi
 */
import { create } from "zustand";
import type { ReportProject } from "./report-generator";
import type { SoilLayer } from "@/components/SoilLayerManager";

export type ModuleKey =
  | "tasima-kapasitesi"
  | "oturma"
  | "sivilasma"
  | "sev-stabilitesi"
  | "kazik"
  | "iksa"
  | "yanal-basinc"
  | "deprem"
  | "siniflandirma"
  | "konsolidasyon"
  | "zemin-iyilestirme"
  | "faz-iliskileri"
  | "arazi-deneyleri"
  | "indeks-deneyleri"
  | "gerilme-temel"
  | "gerilme-dagilimi"
  | "istinat-duvari"
  | "saha-tepki";

export const MODULE_META: Record<ModuleKey, { icon: string; label: string; methods: string[] }> = {
  "tasima-kapasitesi": { icon: "🏗️", label: "Taşıma Kapasitesi", methods: ["Terzaghi (1943)", "Meyerhof (1963)", "Hansen (1970)", "Vesic (1973)", "Tümü"] },
  "oturma": { icon: "📐", label: "Oturma Hesabı", methods: ["Elastik Oturma", "1D Konsolidasyon", "Schmertmann"] },
  "sivilasma": { icon: "💧", label: "Sıvılaşma", methods: ["Boulanger & Idriss (2014)"] },
  "sev-stabilitesi": { icon: "⛰️", label: "Şev Stabilitesi", methods: ["Bishop", "Janbu", "Fellenius"] },
  "kazik": { icon: "🔩", label: "Kazık Kapasitesi", methods: ["α Yöntemi", "β Yöntemi", "SPT Meyerhof"] },
  "iksa": { icon: "🏢", label: "İksa Tasarımı", methods: ["Konsol", "Tek Ankrajlı", "Çok Ankrajlı"] },
  "yanal-basinc": { icon: "🧱", label: "Yanal Toprak Basıncı", methods: ["Rankine", "Coulomb", "Mononobe-Okabe"] },
  "deprem": { icon: "🌍", label: "Deprem Parametreleri", methods: ["TBDY 2018"] },
  "siniflandirma": { icon: "🧪", label: "Zemin Sınıflandırma", methods: ["USCS", "AASHTO", "TBDY 2018"] },
  "konsolidasyon": { icon: "⏱️", label: "Konsolidasyon Analizi", methods: ["Zaman-Oturma", "PVD Hansbo"] },
  "zemin-iyilestirme": { icon: "🔨", label: "Zemin İyileştirme", methods: ["Dinamik Kompaksiyon", "Taş Kolon", "Ön Yükleme"] },
  "faz-iliskileri": { icon: "🔬", label: "Faz İlişkileri", methods: ["Faz Hesabı", "Proctor"] },
  "arazi-deneyleri": { icon: "🔍", label: "Arazi Deneyleri", methods: ["Efektif Gerilme", "SPT Korelasyon", "Darcy"] },
  "indeks-deneyleri": { icon: "📊", label: "İndeks Deneyleri", methods: ["Atterberg", "Dane Dağılımı"] },
  "gerilme-temel": { icon: "🎯", label: "Gerilme & Temel", methods: ["Mohr Dairesi", "Temel Boyutlandırma"] },
  "gerilme-dagilimi": { icon: "📐", label: "Gerilme Dağılımı", methods: ["Boussinesq", "CBR"] },
  "istinat-duvari": { icon: "🧱", label: "İstinat Duvarı", methods: ["Ağırlık Duvarı", "Donatılı Zemin"] },
  "saha-tepki": { icon: "📡", label: "Saha Tepki", methods: ["Vs30 Büyütme", "Transfer Fonksiyonu"] },
};

export interface ReportSection {
  id: string;
  moduleKey: ModuleKey;
  method: string;
  inputs: Record<string, number | string>;
  results: Record<string, any> | null;
  computed: boolean;
}

interface ReportStore {
  step: number;
  project: ReportProject;
  sections: ReportSection[];
  soilLayers: SoilLayer[];
  waterTableDepth: number;
  setStep: (s: number) => void;
  updateProject: (p: Partial<ReportProject>) => void;
  addSection: (moduleKey: ModuleKey) => void;
  removeSection: (id: string) => void;
  updateSectionInputs: (id: string, inputs: Record<string, number | string>) => void;
  updateSectionMethod: (id: string, method: string) => void;
  updateSectionResults: (id: string, results: Record<string, any>) => void;
  setSoilLayers: (layers: SoilLayer[]) => void;
  setWaterTableDepth: (d: number) => void;
  reset: () => void;
}

const defaultProject: ReportProject = {
  projectName: "",
  projectLocation: "",
  projectOwner: "",
  reportDate: new Date().toLocaleDateString("tr-TR"),
  reportNo: `GF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  engineer: "",
  company: "",
};

let _id = 0;
const uid = () => `sec_${++_id}_${Date.now()}`;

export const useReportStore = create<ReportStore>((set) => ({
  step: 0,
  project: { ...defaultProject },
  sections: [],
  soilLayers: [],
  waterTableDepth: 3,
  setStep: (step) => set({ step }),
  updateProject: (p) => set((s) => ({ project: { ...s.project, ...p } })),
  addSection: (moduleKey) =>
    set((s) => ({
      sections: [
        ...s.sections,
        {
          id: uid(),
          moduleKey,
          method: MODULE_META[moduleKey].methods[0],
          inputs: {},
          results: null,
          computed: false,
        },
      ],
    })),
  removeSection: (id) => set((s) => ({ sections: s.sections.filter((sec) => sec.id !== id) })),
  updateSectionInputs: (id, inputs) =>
    set((s) => ({
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, inputs, results: null, computed: false } : sec)),
    })),
  updateSectionMethod: (id, method) =>
    set((s) => ({
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, method, results: null, computed: false } : sec)),
    })),
  updateSectionResults: (id, results) =>
    set((s) => ({
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, results, computed: true } : sec)),
    })),
  setSoilLayers: (soilLayers) => set({ soilLayers }),
  setWaterTableDepth: (waterTableDepth) => set({ waterTableDepth }),
  reset: () => set({ step: 0, project: { ...defaultProject }, sections: [], soilLayers: [], waterTableDepth: 3 }),
}));
