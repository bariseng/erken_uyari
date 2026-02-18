/**
 * GeoForce — Rapor State Yönetimi (Zustand)
 * Çoklu hesap bölümü, proje bilgileri, PDF üretimi
 * + localStorage kalıcılığı
 * + Yeni alanlar: yapı türü, deprem bölgesi, logo, vb.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  | "saha-tepki"
  | "braced-excavation"
  | "pad-footing"
  | "soil-properties-db"
  | "destekli-kazi"
  | "tekil-temel"
  | "zemin-ozellik-db";

export const MODULE_META: Record<ModuleKey, { icon: string; label: string; methods: string[]; connected: boolean }> = {
  "tasima-kapasitesi": { icon: "🏗️", label: "Taşıma Kapasitesi", methods: ["Terzaghi (1943)", "Meyerhof (1963)", "Hansen (1970)", "Vesic (1973)", "Tümü"], connected: true },
  "oturma": { icon: "📐", label: "Oturma Hesabı", methods: ["Elastik Oturma", "1D Konsolidasyon", "Schmertmann"], connected: true },
  "sivilasma": { icon: "💧", label: "Sıvılaşma", methods: ["Boulanger & Idriss (2014)"], connected: true },
  "sev-stabilitesi": { icon: "⛰️", label: "Şev Stabilitesi", methods: ["Bishop", "Janbu", "Fellenius"], connected: true },
  "kazik": { icon: "🔩", label: "Kazık Kapasitesi", methods: ["α Yöntemi", "β Yöntemi", "SPT Meyerhof"], connected: true },
  "iksa": { icon: "🏢", label: "İksa Tasarımı", methods: ["Konsol", "Tek Ankrajlı", "Çok Ankrajlı"], connected: true },
  "yanal-basinc": { icon: "🧱", label: "Yanal Toprak Basıncı", methods: ["Rankine", "Coulomb", "Mononobe-Okabe"], connected: true },
  "deprem": { icon: "🌍", label: "Deprem Parametreleri", methods: ["TBDY 2018"], connected: true },
  "siniflandirma": { icon: "🧪", label: "Zemin Sınıflandırma", methods: ["USCS", "AASHTO", "TBDY 2018"], connected: true },
  "konsolidasyon": { icon: "⏱️", label: "Konsolidasyon Analizi", methods: ["Zaman-Oturma", "PVD Hansbo"], connected: true },
  "zemin-iyilestirme": { icon: "🔨", label: "Zemin İyileştirme", methods: ["Dinamik Kompaksiyon", "Taş Kolon", "Ön Yükleme"], connected: true },
  "faz-iliskileri": { icon: "🔬", label: "Faz İlişkileri", methods: ["Faz Hesabı", "Proctor"], connected: true },
  "arazi-deneyleri": { icon: "🔍", label: "Arazi Deneyleri", methods: ["Efektif Gerilme", "SPT Korelasyon", "Darcy"], connected: true },
  "indeks-deneyleri": { icon: "📊", label: "İndeks Deneyleri", methods: ["Atterberg", "Dane Dağılımı"], connected: true },
  "gerilme-temel": { icon: "🎯", label: "Gerilme & Temel", methods: ["Mohr Dairesi", "Temel Boyutlandırma"], connected: true },
  "gerilme-dagilimi": { icon: "📐", label: "Gerilme Dağılımı", methods: ["Boussinesq", "CBR"], connected: true },
  "istinat-duvari": { icon: "🧱", label: "İstinat Duvarı", methods: ["Ağırlık Duvarı", "Donatılı Zemin"], connected: true },
  "saha-tepki": { icon: "📡", label: "Saha Tepki", methods: ["Vs30 Büyütme", "Transfer Fonksiyonu"], connected: true },
  "braced-excavation": { icon: "🏗️", label: "Destekli Kazı", methods: ["Peck (1969)", "FHWA"], connected: true },
  "pad-footing": { icon: "🧱", label: "Tekil Temel", methods: ["ACI 318", "TS 500"], connected: true },
  "soil-properties-db": { icon: "📚", label: "Zemin Özellikleri DB", methods: ["Korelasyon Tablosu"], connected: true },
  "destekli-kazi": { icon: "🏗️", label: "Destekli Kazı", methods: ["Peck (1969)"], connected: true },
  "tekil-temel": { icon: "🧱", label: "Tekil Temel Tasarım", methods: ["Zımbalama + Stabilite"], connected: true },
  "zemin-ozellik-db": { icon: "📋", label: "Zemin Özellik Tahmini", methods: ["USCS+SPT Korelasyon"], connected: true },
};

// ─── Yapı Türü Seçenekleri ───
export const BUILDING_TYPES = [
  { value: "residential", label: "Konut" },
  { value: "commercial", label: "Ticari" },
  { value: "industrial", label: "Endüstriyel" },
  { value: "infrastructure", label: "Altyapı" },
  { value: "other", label: "Diğer" },
] as const;

// ─── Deprem Bölgesi Seçenekleri (TBDY 2018) ───
export const SEISMIC_ZONES = [
  { value: "DD-1", label: "DD-1 (1. Derece)", PGA: 0.4 },
  { value: "DD-2", label: "DD-2 (2. Derece)", PGA: 0.3 },
  { value: "DD-3", label: "DD-3 (3. Derece)", PGA: 0.2 },
  { value: "DD-4", label: "DD-4 (4. Derece)", PGA: 0.1 },
] as const;

// ─── Genişletilmiş Proje Tipi ───
export interface ExtendedProject extends ReportProject {
  buildingType?: string;
  seismicZone?: string;
  companyLogo?: string; // base64
  projectDescription?: string;
  drillingRef?: string;
}

export interface ReportSection {
  id: string;
  moduleKey: ModuleKey;
  method: string;
  inputs: Record<string, number | string>;
  results: Record<string, any> | null;
  computed: boolean;
  notes?: string;
  charts?: string[]; // base64 PNG
}

interface ReportStore {
  step: number;
  project: ExtendedProject;
  sections: ReportSection[];
  soilLayers: SoilLayer[];
  waterTableDepth: number;
  setStep: (s: number) => void;
  updateProject: (p: Partial<ExtendedProject>) => void;
  addSection: (moduleKey: ModuleKey) => void;
  removeSection: (id: string) => void;
  updateSectionInputs: (id: string, inputs: Record<string, number | string>) => void;
  updateSectionMethod: (id: string, method: string) => void;
  updateSectionResults: (id: string, results: Record<string, any>) => void;
  updateSectionNotes: (id: string, notes: string) => void;
  updateSectionCharts: (id: string, charts: string[]) => void;
  setSoilLayers: (layers: SoilLayer[]) => void;
  setWaterTableDepth: (d: number) => void;
  reset: () => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
}

const defaultProject: ExtendedProject = {
  projectName: "",
  projectLocation: "",
  projectOwner: "",
  reportDate: new Date().toLocaleDateString("tr-TR"),
  reportNo: `GF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  engineer: "",
  company: "",
  buildingType: "",
  seismicZone: "DD-2",
  companyLogo: "",
  projectDescription: "",
  drillingRef: "",
};

let _id = 0;
const uid = () => `sec_${++_id}_${Date.now()}`;

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
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
              notes: "",
              charts: [],
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

      updateSectionNotes: (id, notes) =>
        set((s) => ({
          sections: s.sections.map((sec) => (sec.id === id ? { ...sec, notes } : sec)),
        })),

      updateSectionCharts: (id, charts) =>
        set((s) => ({
          sections: s.sections.map((sec) => (sec.id === id ? { ...sec, charts } : sec)),
        })),

      setSoilLayers: (soilLayers) => set({ soilLayers }),

      setWaterTableDepth: (waterTableDepth) => set({ waterTableDepth }),

      reset: () => set({ step: 0, project: { ...defaultProject }, sections: [], soilLayers: [], waterTableDepth: 3 }),

      reorderSections: (fromIndex, toIndex) =>
        set((s) => {
          const newSections = [...s.sections];
          const [removed] = newSections.splice(fromIndex, 1);
          newSections.splice(toIndex, 0, removed);
          return { sections: newSections };
        }),
    }),
    {
      name: "geoforce-report-storage",
      partialize: (state) => ({
        project: state.project,
        sections: state.sections,
        soilLayers: state.soilLayers,
        waterTableDepth: state.waterTableDepth,
      }),
    }
  )
);
